const express = require("express");
const comprouter = express.Router();
const sendmesage = require("./utilities.js").sendmessage;
const TOPSCORES = require("./league.js").TOPSCORES;
const FIXTURES = require("./league.js").FIXTURES;
const RESULTS = require("./league.js").RESULTS;
const grouptables = require("./utilities.js").grouptables;

//fix get groups for real

global.maincompetition = function  (req) {
    let num = req.body.messages[0].from;
    greeting(req, num);
}

function greeting(req, num) {
    let name = req.body.contacts[0].profile.name;
    session[num] = competitionresponse;
    sendmesage
        (`Hi ${name} 👋 👋 
Get all ${league_name[num]} highlights ⚽
⌨️ Reply with
1. To get today's fixtures 📌
2. To get today's results 📌
3. To get top scorers 📌
4. To get groups 📌
5. Teams(fixtures,results,lineups) 📌
6. Get live highlights from a game 🔥 🔥
7. Go back to the main menu 🔙`, num);    
}

function competitionresponse (req) {
    let num = req.body.messages[0].from;
    greetingresponse(req,num);
}

function greetingresponse(req, num) {
    let response = req.body.messages[0].text.body;
    switch (response) {
        case '1':
            FIXTURES(num, maincompetition);
            break;
        case '2':
            RESULTS(num, maincompetition);
            break;
        case '3':
            TOPSCORES(num, maincompetition);
            break;
        case '4':
            GROUPS(num);
            break;
        case '5':
            session[num] = mainteam;
            session[num](req);
            break;
        case '6':
            session[num] = mainlive;
            session[num](req);
            break;
        case '7':
            session[num] = undefined;
            sendmesage("⌨️ Reply with anything to go back to the main menu 🔙", num);
            break;
        default:
            session[num] = competitionresponse;
            sendmesage(`🆘 Wrong response 🆘
⌨️ Reply with
1. To get today's fixtures 📌
2. To get today's results 📌
3. To get top scorers 📌
4. To get groups 📌
5. Teams(fixtures,results,lineups) 📌
6. Get live highlights from a game 🔥 🔥
7. Go back to the main menu 🔙`, num); 
        }
}

function GROUPS(num) {
    let qs = { league: leugue_id[num], season: '2021' };
    grouptables(qs, num).then(() => {
        sendmesage("⌨️ Reply with anything to go back 🔙", num);
        session[num] = maincompetition;
    }).catch(e => { console.log(e) });
}

module.exports = comprouter;