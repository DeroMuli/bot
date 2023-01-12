let express = require("express");
const coderouter = express.Router();
const sendmessage = require("./utilities.js").sendmessage;
const getteamresults = require("./utilities.js").getteamresults;
const getteamfixtures = require("./utilities.js").getteamfixtures;
const getplayerstats = require("./utilities.js").getplayerstats;
const leaguetopscorers = require("./utilities.js").leaguetopscorers;
const leaguetable = require("./utilities.js").leaguetable;
const leagueresults = require("./utilities.js").leagueresults;
const leaguefixture = require("./utilities.js").leaguefixture;
const leagueassists = require("./utilities.js").leagueassists;
const date = require("./utilities.js").getdate;
const grouptables = require("./utilities.js").grouptables;

global.mainshort = function (req) {
  let num = req.body.messages[0].from;
  session[num] = shortresponse;
  sendmessage(`⌨️ Reply with a short code to get a response 💬`, num);
  sendmessage(
    `🔥🔥 Short codes 🔥🔥
Use short code : 
⏩ team fixtures teamname ⏪ to get teamname fixtures 📌
⏩ team results teamname ⏪ to get teamname results 📌
⏩ player stats playername ⏪ to get player stats 📌
⏩ top scorers leaguename ⏪ to get leaguename top scorers 📌
⏩ top assists leaguename ⏪ to get leaguename top assists 📌
⏩ table leaguename ⏪ to get leaguename table standings 📌
⏩ groups leaguename ⏪ to get leaguename groups 📌
⏩ league results leaguename ⏪ to get leaguename results 📌
⏩ league fixtures leaguename ⏪ to get leaguename fixtures 📌
⌨️ Reply with exit to go back`,
    num
  );
};

function shortresponse(req) {
  let num = req.body.messages[0].from;
  let response = req.body.messages[0].text.body;
  response = response.toLowerCase();
  let test = response.replace(/ /g, "");
  if (test.includes("teamfixtures")) {
    let teamname = getparameter(2, response);
    getteamfixture(teamname, num);
  } else if (test.includes("teamresults")) {
    let teamname = getparameter(2, response);
    getteamresult(teamname, num);
  } else if (test.includes("playerstats")) {
    let playername = getparameter(2, response);
    getplayerstat(playername, num);
  } else if (test.includes("topscorers")) {
    let leugue = getparameter(2, response);
    let id = getleugeid(leugue);
    gettopscorers(id, num);
  } else if (test.includes("topassists")) {
    let leugue = getparameter(2, response);
    let id = getleugeid(leugue);
    gettopassists(id, num);
  } else if (test.includes("table")) {
    let leugue = getparameter(1, response);
    let id = getleugeid(leugue);
    gettable(id, num);
  } else if (test.includes("leagueresults")) {
    let leugue = getparameter(2, response);
    let id = getleugeid(leugue);
    getleagueresults(id, num);
  } else if (test.includes("leaguefixtures")) {
    let leugue = getparameter(2, response);
    let id = getleugeid(leugue);
    getleaguefixtures(id, num);
  } else if (test.includes("exit")) {
    session[num] = undefined;
    sendmessage("⌨️ Reply with anything to go back to the main menu 🔙", num);
  } else if (test.includes("groups")) {
    let leugue = getparameter(1, response);
    let id = getleugeid(leugue);
    let qs = { league: id, season: "2021" };
    DBNAME[num] = "Competitons";
    grouptables(qs, num)
      .then(() => {
        sendmessage(
          "⌨️ Reply with another short code or exit to go back 🔙",
          num
        );
        DBNAME[num] = "Short";
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    sendmessage(`🆘 Wrong response 🆘`, num);
    sendmessage(
      `🔥🔥 Short codes 🔥🔥
Use short code : 
⏩ team fixtures teamname ⏪ to get teamname fixtures 📌
⏩ team results teamname ⏪ to get teamname results 📌
⏩ player stats playername ⏪ to get player stats 📌
⏩ top scorers leaguename ⏪ to get leaguename top scorers 📌
⏩ top assists leaguename ⏪ to get leaguename top assists 📌
⏩ table leaguename ⏪ to get leaguename table standings 📌
⏩ groups leaguename ⏪ to get leaguename groups 📌
⏩ league results leaguename ⏪ to get leaguename results 📌
⏩ league fixtures leaguename ⏪ to get leaguename fixtures 📌
⌨️ Reply with exit to go back`,
      num
    );
  }
}

function getteamfixture(teamname, num) {
  let qs = { season: "2021", status: "NS", next: "15" };
  getteamfixtures(teamname, qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with another short code or exit to go back 🔙";
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getteamresult(teamname, num) {
  let qs = { season: "2021", status: "FT", last: "15" };
  getteamresults(teamname, qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with another short code or exit to go back 🔙";
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function gettopscorers(id, num) {
  let qs = { season: "2021", league: id };
  leaguetopscorers(qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with another short code or exit to go back 🔙";
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function gettopassists(id, num) {
  let qs = { season: "2021", league: id };
  leagueassists(qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with another short code or exit to go back 🔙";
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function gettable(id, num) {
  let qs = { league: id, season: "2021" };
  leaguetable(qs, num)
    .then((ans) => {
      ans += "⌨️ Reply with another short code or exit to go back 🔙";
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getplayerstat(playername, num) {
  let qs = { season: "2021", search: playername, league: "39" };
  getplayerstats(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with another short code or exit to go back 🔙`;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getleaguefixtures(id, num) {
  let qs = { date: date(), league: id, season: "2021" };
  leaguefixture(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with another short code or exit to go back 🔙`;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getleagueresults(id, num) {
  let qs = { date: date(), league: id, season: "2021", status: "FT" };
  leagueresults(qs, num)
    .then((ans) => {
      ans += `⌨️ Reply with another shord code or exit to go back 🔙`;
      sendmessage(ans, num);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getparameter(numofcommand, spaced) {
  spaced = spaced.trim();
  let array = spaced.split(/ /g);
  array = array.map((word) => {
    return word.trim();
  });
  array = array.filter((word) => word !== " " && word !== "");
  let teamname = "";
  for (let index = numofcommand; index < array.length; index++) {
    teamname += `${array[index]} `;
  }
  return teamname.trim();
}

function getleugeid(leaguename) {
  leaguename = leaguename.trim();
  leaguename = leaguename.toLowerCase();
  switch (leaguename) {
    case "epl":
      return 39;
    case "english premier league":
      return 39;
    case "premier league":
      return 39;
    case "la liga":
      return 140;
    case "bundesliga":
      return 78;
    case "serie a":
      return 135;
    case "ligue 1":
      return 61;
    case "uefa":
      return 2;
    case "uefa championship league":
      return 2;
    case "World Cup":
      return 1;
    case "Europa":
      return 848;
    default:
      return 0;
  }
}

module.exports = coderouter;
