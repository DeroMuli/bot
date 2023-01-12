let express = require("express");
const teamrouter = express.Router();
const sendmessage = require("./utilities.js").sendmessage;
const getteamresults = require("./utilities.js").getteamresults;
const getteamfixtures = require("./utilities.js").getteamfixtures;
const getteamstats = require("./utilities.js").getteamstats;
const getdate = require("./utilities.js").getdate;

global.mainteam = function (req) {
  let num = req.body.messages[0].from;
  greeting(req, num);
};

function greeting(req, num) {
  let name = req.body.contacts[0].profile.name;
  session[num] = teamresponse;
  sendmessage(
    `Hi ${name} 👋 👋
Get all ${league_name[num]} team statistics ⚽
⌨️ Reply with
1. To get a specific team's statistics 📌
2. To get a specific team's result 📌
3. To get a specific team's fixtures 📌
4. To get a team's fixture this gameweak 📌
5. To go back 🔙`,
    num
  );
}

function teamresponse(req) {
  let num = req.body.messages[0].from;
  greetingresponse(req, num);
}

function greetingresponse(req, num) {
  let response = req.body.messages[0].text.body;
  switch (response) {
    case "5":
      session[num] =
        DBNAME[num] == "Competitons" ? maincompetition : mainleague;
      session[num](req);
      break;
    case "1":
      session[num] = stats;
      session[num](req);
      break;
    case "2":
      session[num] = results;
      session[num](req);
      break;
    case "3":
      session[num] = fixture;
      session[num](req);
      break;
    case "4":
      session[num] = gameweek;
      session[num](req);
      break;
    default:
      session[num] = teamresponse;
      sendmessage(
        `🆘 Wrong response 🆘
⌨️ Reply with
1. To get a specific team's statistics 📌
2. To get a specific team's result 📌
3. To get a specific team's fixtures 📌
4. To get a team's fixture this gameweak 📌
5. To go back 🔙`,
        num
      );
  }
}

function stats(req) {
  let num = req.body.messages[0].from;
  session[num] = statsresponse;
  TeamGreeting(num);
}

function statsresponse(req) {
  let num = req.body.messages[0].from;
  let teamname = req.body.messages[0].text.body;
  let qs = { season: "2021", league: leugue_id[num] };
  getteamstats(teamname, qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with anything to go back 🔙`;
      session[num] = mainteam;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function results(req) {
  let num = req.body.messages[0].from;
  session[num] = resultsresponse;
  TeamGreeting(num);
}

function resultsresponse(req) {
  let num = req.body.messages[0].from;
  let teamname = req.body.messages[0].text.body;
  let qs = { league: leugue_id[num], season: "2021", status: "FT", last: "15" };
  getteamresults(teamname, qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with anything to go back 🔙";
      session[num] = mainteam;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function fixture(req) {
  let num = req.body.messages[0].from;
  session[num] = fixtureresponse;
  TeamGreeting(num);
}

function fixtureresponse(req) {
  let num = req.body.messages[0].from;
  let teamname = req.body.messages[0].text.body;
  let qs = { league: leugue_id[num], season: "2021", status: "NS", next: "15" };
  getteamfixtures(teamname, qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with anything to go back 🔙";
      session[num] = mainteam;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function gameweek(req) {
  let num = req.body.messages[0].from;
  TeamGreeting(num);
  session[num] = gameweekresponse;
}

function gameweekresponse(req) {
  let num = req.body.messages[0].from;
  let teamname = req.body.messages[0].text.body;
  let todaydate = getdate();
  let weeklater = new Date(todaydate);
  weeklater.setDate(weeklater.getDate() + 7);
  weeklater = weeklater.toISOString().split("T")[0];
  let previous = DBNAME[num];
  DBNAME[num] = "GAMEWEEK";
  let qs = { season: "2021", status: "NS", from: todaydate, to: weeklater };
  getteamfixtures(teamname, qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with anything to go back 🔙";
      session[num] = mainteam;
      sendmessage(ans, num);
      DBNAME[num] = previous;
      console.log(DBNAME[num]);
    })
    .catch((e) => {
      console.log(e);
    });
}

function TeamGreeting(num) {
  sendmessage(`⌨️ Reply with the name of the team `, num);
}

module.exports = teamrouter;
