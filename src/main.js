let express = require("express");
const mainRouter = express.Router();
const sendmesage = require("./utilities.js").sendmessage;
global.leugue_id = [];
global.session = [];
global.league_name = [];

mainRouter.post("/", (req, res, next) => {
    if (req.body.messages && req.body.contacts) {
        let num = req.body.messages[0].from;
        if (session[num] == undefined) {
            greeting(num);
        }
        else {
            session[num](req);
        }
    }
    res.sendStatus(200);
});

function greeting(num) {
    session[num] = mainresponse;
    sendmesage(
        ` Welcome to hekaya bot 👋 👋 
⚽ Get all your football fixes ⚽
⌨️ Reply with
1. To get EPL information 📌
2. To get La liga information 📌
3. To get Bundesliga information 📌
4. To get Serie A information 📌
5. To get Ligue 1 information 📌
6. To get World cup information 📌
7. To get UEFA CHAMPIONSHIP LEAGUE information 📌
8. To get Europa information 📌
9. To use short codes 🔥 🔥`, num);
}

function mainresponse (req) {
    let num = req.body.messages[0].from;
    let response = req.body.messages[0].text.body;
    switch (response) {
        case '1':
            session[num] = mainleague;
            leugue_id[num] = '39';
            DBNAME[num] = "leagues";
            league_name[num] = 'EPL';
            break;
        case '2':
            session[num] = mainleague;
            leugue_id[num] = '140';
            DBNAME[num] = "leagues";
            league_name[num] = 'La Liga';
            break;
        case '3':
            session[num] = mainleague;
            leugue_id[num] = '78';
            DBNAME[num] = "leagues";
            league_name[num] = 'Bundesliga';
            break;
        case '4':
            session[num] = mainleague;
            leugue_id[num] = '135';
            DBNAME[num] = "leagues";
            league_name[num] = 'Serie A';
            break;
        case '5':
            session[num] = mainleague;
            leugue_id[num] = '61';
            DBNAME[num] = "leagues";
            league_name[num] = 'Ligue 1';
            break;
        case '6':
            session[num] = maincompetition;
            leugue_id[num] = '1';
            DBNAME[num] = "Competitons";
            league_name[num] = "World Cup";
            break;
        case '7':
            session[num] = maincompetition;
            leugue_id[num] = '2';
            DBNAME[num] = "Competitons";
            league_name[num] = "UEFA";
            break;
        case '8':
            session[num] = maincompetition;
            leugue_id[num] = '848';
            DBNAME[num] = "Competitons";
            league_name[num] = "Europa";
            break;
        case '9':
            session[num] = mainshort;
            DBNAME[num] = "Short";
            break;
        default:
            session[num] = mainresponse;
            sendmesage(
                ` 🆘 Wrong reply 🆘
⌨️ Reply with 
1. To get EPL information 📌
2. To get La liga information 📌
3. To get Bundesliga information 📌
4. To get Serie A information 📌
5. To get Ligue 1 information 📌
6. To get World cup information 📌
7. To get UEFA CHAMPIONSHIP LEAGUE information 📌
8. To get Europa information 📌
9. To use short codes 🔥 🔥 `, num);
            return;
    }
    session[num](req);
}

module.exports = mainRouter;
module.exports.greeting = greeting;