let express = require("express");
const playerrouter = express.Router();
const sendmessage = require('./utilities.js').sendmessage;
const getplayerstats = require("./utilities.js").getplayerstats;
const leaguereds = require("./utilities.js").leaguereds;
const leagueassists = require("./utilities.js").leagueassists;
const leagueyellows = require("./utilities.js").leagueyellows;

global.mainplayer = function (req) {
    let num = req.body.messages[0].from;
    greeting(req,num);
}

function greeting(req,num) {
    let name = req.body.contacts[0].profile.name;
    session[num] = playerresponse;
    sendmessage
        (`Hi ${name} 👋 👋 
⌨️ Reply with : 
1. To get players with top assists ⭐ ⭐
2. To get players with most Yellow cards 🟨
3. To get players with most Red cards 🟥 
4. To get a player statistics 📌
5. To go back 🔙`, num);
}

function playerresponse (req) {
    let num = req.body.messages[0].from;
    greetingresponse(req, num);
}

function greetingresponse(req, num) {
    let response = req.body.messages[0].text.body;
    switch (response) {
        case '5':
            session[num] = mainleague;
            session[num](req);
            break;
        case '4':
            STATS(num);
            break;
        case '1':
            ASSISTS(num);
            break;
        case '2':
            YELLOW(num);
            break;
        case '3':
            RED(num);
            break;
        default:
            session[num] = playerresponse;
            sendmessage(` 🆘 Wrong response 🆘
⌨️ Reply with
1. To get players with top assists ⭐ ⭐
2. To get players with most Yellow cards 🟨
3. To get players with most Red cards 🟥 
4. To get a player statistics 📌
5. To go back 🔙 `, num);
        }
}

function YELLOW(num) {
    let qs = { season: '2021', league: leugue_id[num] };
    leagueyellows(qs, num).then(ans => {
        ans += `⌨️ Reply with anything to go back 🔙`;
        session[num] = mainplayer;
        sendmessage(ans, num);
    }).catch(e => { console.log(e) });
}

function RED(num) {
    let qs = { season: '2021', league: leugue_id[num] };
    leaguereds(qs, num).then(ans => {
        ans += `⌨️ Reply with anything to go back 🔙`;
        session[num] = mainplayer;
        sendmessage(ans, num);
    }).catch(e => { console.log(e) });
}

function ASSISTS(num) {
    let qs = { season: '2021', league: leugue_id[num] };
    leagueassists(qs, num).then(ans => {
        ans += `⌨️ Reply with anything to go back 🔙`;
        session[num] = mainplayer;
        sendmessage(ans, num);
    }).catch(e => { console.log(e) });
}

function STATS(num) {
    session[num] = playerstats;
    sendmessage(`⌨️ Reply with the player name to get player stats 💬`, num);
}

function playerstats (req)  {
    let num = req.body.messages[0].from;
    statsresponse(req ,num);
}

function statsresponse(req,num) {
    let name = req.body.messages[0].text.body;
    let qs = { season: '2021', league: leugue_id[num], search: name };
    getplayerstats(qs, num).then(ans => {
        ans += `⌨️ Reply with anything to go back 🔙`;
        session[num] = mainplayer;
        sendmessage(ans, num);
    }).catch(e => { console.log(e) });
}

module.exports = playerrouter;