let express = require("express");
let request = require("request");
let util = require("util");
const liverouter = express.Router();
const sendmessage = require('./utilities.js').sendmessage;
const date = require("./utilities.js").getdate;
const getdb = require("./utilities.js").getdb;
let moment = require("moment-timezone");
const sendmessagewithurl = require('./utilities.js').sendmessagewithurl;
const key = '48cf1b9b3a3f9abd2170a9d35334b51e';
let temp = [];
let timer = [];
let ids = [];
let homegoals = [];
let awaygoals = [];

global.mainlive = function (req) {
    let num = req.body.messages[0].from;
    greeting(req, num);
}

function greeting(req,num) {
    let name = req.body.contacts[0].profile.name;
    sendmessage(` 💫 💫 Live Games 💫 💫 
⌨️ Reply with
1. To get all live games today 🔥 🔥
2. To go back 🔙`, num);
    session[num] = liveresponse;
}

function liveresponse (req, res, next)  {
    let num = req.body.messages[0].from;
    greetingresponse(req, res, num)
}

function greetingresponse(req, res, num) {
    let response = req.body.messages[0].text.body;
    switch (response) {
        case '1':
            getteamfixtures(num);
            break;
        case '2':
            session[num] = (DBNAME[num] == "Competitons") ? maincompetition : mainleague;
            session[num](req)
            break;
        default:
            sendmessage(`🆘 Wrong response 🆘
⌨️ Reply with
1. To get all live games today 🔥 🔥
2. To go back 🔙`, num);
        }
}

async function getteamfixtures(num) {
    let qs = { date: date(), season: '2021', league: leugue_id[num] };
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/fixtures',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    if (data.response[0]) {
        let list = data.response;
        let ans = " ⌨️ Reply with";
        ans += "\n";
        let counter = 1;
        for (let entry of list) {
            let hometeamname = entry.teams.home.name;
            let awayteamname = entry.teams.away.name;
            let hometeamgoal = entry.goals.home;
            let awayteamgoal = entry.goals.away;
            let time = entry.fixture.status.elapsed;
            time = (time == null) ? "(not started ⏰)" : `(${time} minutes ⏳ )`;
            ans += `${counter}. ${hometeamname} : ${hometeamgoal} ${awayteamname} : ${awayteamgoal} `;
            ans += "\n";
            ans += `             ${time}     `;
            ans += "\n\n";
            temp[counter] = entry.fixture.id;
            let rawtime = entry.fixture.date;
            let timezone = "Africa/Nairobi";
            let timez = moment(rawtime).tz(timezone).format('YYYY-MM-DD HH:mm');
            let datetime = new Date(timez);
            timer[counter] = datetime;
            counter++;
        }
        ans += "to get the game live highlights 🔔";
        ans = ans.replace(/null/g, "0");
        ans += "\n\n\n";
        sendmessage(ans, num);
        session[num] = livegames;
    }
    else {
        sendmessage("No games today to follow 😔😔", num);
        sendmessage(" ⌨️ Reply with anything to go back 🔙", num);
        session[num] = mainlive;
    }
}

function livegames (req)  {
    let num = req.body.messages[0].from;
    let response = req.body.messages[0].text.body;
    let gameid = temp[response];
    temp[num] = gameid;
    delete temp[response];
    let timeid = timer[response];
    triggergamestart(timeid, num);
    sendmessage(`You will receive highlights of the game 🙂🙂`, num);
    session[num] = undefined;
    sendmessage("⌨️ Reply with anything to go back to the main menu 🔙", num);
}

function triggergamestart(time, num) {
    let string = (new Date()).toLocaleString();
    let timezone = "Africa/Nairobi";
    let timez = moment(string).tz(timezone).format('YYYY-MM-DD HH:mm');
    let now = new Date(timez);
    if (now.getTime() > time.getTime()) {
        getgamehighlights(num);
    }
    else {
        let interval = time.getTime() - now.getTime();
        getgamehighlights(num, interval)
    }
}

async function getgamehighlights(num,interval) {
    let db = await getdb("LIVE");
    let id = temp[num];
    let cursor = await db.collection("games").count({ name: `${id}` }, { limit: 1 });
    if (!cursor) {
        let query = { name: `${id}` };
        let values = { $set: { numbers: "" } };
        await db.collection("games").updateOne(query, values, { upsert: true });
        if (interval) {
            setTimeout(() => { startteamgame(id); }, interval);
        }
        else {
            startteamgame(id);
        }
    }
    let results = await db.collection("games").findOne({ name: `${id}` }).catch(err => { console.log(err) });
    let numbers = results.numbers;
    numbers += "\n" + num;
    let query = { name: `${id}` };
    let values = { $set: { numbers: numbers } };
    await db.collection("games").updateOne(query, values, { upsert: true });
}

//not quite finished (5 minutes interval) ... check with live game
function startteamgame(id) {
    homegoals[id] = 0;
    awaygoals[id] = 0;
    let game = setInterval(async function () {
        ids[id] = game;
        let db = await getdb("LIVE");
        let qs = { id: id };
        let options = {
            method: 'GET',
            url: 'https://v3.football.api-sports.io/fixtures',
            qs: qs,
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': key
            }
        };
        let req = util.promisify(request);
        let rawbody = await req(options);
        let data = JSON.parse(rawbody.body);
        if (data.response[0]) {
            let entry = data.response[0];
            let status = entry.fixture.status.short;
            if (status == 'FT') {
                await db.collection("games").deleteOne({ name: `${id}` }).catch(err => { console.log(err) });
                clearInterval(ids[id]);
            }
            else {
                let hometeamname = entry.teams.home.name;
                let awayteamname = entry.teams.away.name;
                let hometeamgoal = (entry.goals.home == null) ? 0 : entry.goals.home;
                let awayteamgoal = (entry.goals.away == null) ? 0 : entry.goals.away;
                let time = entry.fixture.status.elapsed;
                console.log(`${hometeamname}  ${hometeamgoal}`)
                if (homegoals[id] != hometeamgoal || awaygoals[id] != awayteamgoal) {
                    let ans = "GOALLLLLL !!!!!!! \n";
                    ans += `${hometeamname} : ${hometeamgoal}   ${awayteamname} : ${awayteamgoal}`;
                    ans += `            (${time})       `;
                    let results = await db.collection("games").findOne({ name: `${id}` }).catch(err => { console.log(err) });
                    let numbers = results.numbers;
                    let nums = numbers.split("\n");
                    nums.splice(0, 1);
                    nums.forEach(num => { sendmessage(ans, num) })
                    homegoals[id] = hometeamgoal;
                    awaygoals[id] = awayteamgoal;
                }
                
            }
        }

    }, 5 * 60 * 1000);
}

module.exports = liverouter;