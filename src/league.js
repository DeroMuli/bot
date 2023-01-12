let express = require("express");
const botRouter = express.Router();
const sendmesage = require("./utilities.js").sendmessage;
const date = require("./utilities.js").getdate;
const leaguetopscorers = require("./utilities.js").leaguetopscorers;
const leaguetable = require("./utilities.js").leaguetable;
const leagueresults = require("./utilities.js").leagueresults;
const leaguefixture = require("./utilities.js").leaguefixture;

global.mainleague = function (req) {
  let num = req.body.messages[0].from;
  greeting(req, num);
};

function leagueresponse(req) {
  let num = req.body.messages[0].from;
  greetingresponse(req, num);
}

function greeting(req, num) {
  let name = req.body.contacts[0].profile.name;
  session[num] = leagueresponse;
  sendmesage(
    `Hi ${name} 👋 👋  
Get all ${league_name[num]} highlights ⚽
⌨️ Reply with
1. To get today's fixtures 📌
2. To get today's results 📌
3. To get top scorers 📌
4. To get the ${league_name[num]} table standings 📌
5. To get player stats 📌
6. Teams(fixtures,results,lineups) 📌
7. Get live highlights from a game 🔥 🔥
8. Go back to the main menu 🔙`,
    num
  );
}

function greetingresponse(req, num) {
  let response = req.body.messages[0].text.body;
  switch (response) {
    case "1":
      FIXTURES(num, mainleague);
      break;
    case "2":
      RESULTS(num, mainleague);
      break;
    case "3":
      TOPSCORES(num, mainleague);
      break;
    case "4":
      TABLE(num);
      break;
    case "5":
      session[num] = mainplayer;
      session[num](req);
      break;
    case "6":
      session[num] = mainteam;
      session[num](req);
      break;
    case "7":
      session[num] = mainlive;
      session[num](req);
      break;
    case "8":
      session[num] = undefined;
      sendmesage("⌨️ Reply with anything to go back to the main menu 🔙", num);
      break;
    default:
      session[num] = leagueresponse;
      sendmesage(
        ` 🆘 Wrong response 🆘
⌨️ Reply with
1. To get today's fixtures 📌
2. To get today's results 📌
3. To get top scorers 📌
4. To get the ${league_name[num]} table standings 📌
5. To get player stats 📌
6. Teams(fixtures,results,lineups) 📌
7. Get live highlights from a game 🔥 🔥
8. Go back to the main menu 🔙`,
        num
      );
  }
}

function FIXTURES(num, sesionfunc) {
  let qs = { date: date(), league: leugue_id[num], season: "2021" };
  leaguefixture(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with anything to go back 🔙`;
      session[num] = sesionfunc;
      sendmesage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function RESULTS(num, sesionfunc) {
  let qs = {
    date: date(),
    league: leugue_id[num],
    season: "2021",
    status: "FT",
  };
  leagueresults(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with anything to go back 🔙`;
      session[num] = sesionfunc;
      sendmesage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function TOPSCORES(num, sesionfunc) {
  let qs = { season: "2021", league: leugue_id[num] };
  leaguetopscorers(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with anything to go back 🔙`;
      session[num] = sesionfunc;
      sendmesage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function TABLE(num) {
  let qs = { league: leugue_id[num], season: "2021" };
  leaguetable(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with anything to go back 🔙`;
      session[num] = mainleague;
      sendmesage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

module.exports = botRouter;
module.exports.TOPSCORES = TOPSCORES;
module.exports.FIXTURES = FIXTURES;
module.exports.RESULTS = RESULTS;
