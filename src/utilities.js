let util = require("util");
const key = 'footbal api key';
let request = require("request");
let moment = require("moment-timezone");
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb+srv://hekaya:muli@cluster0.gjt5p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let assert = require("assert");

async function getDB(dbname) {
    let client = await MongoClient.connect(url).catch(err => { console.log(err); });
    let db = client.db(dbname);
    return db;
}

function sendmessage(msg,num) {
    var options = {
        method: 'POST',
        url: 'https://waba.360dialog.io/v1/messages/',
        headers: {
            'D360-Api-Key': "Your key",
        },
        body: {
            to : num,
            type : "text",
            text: {
                body: msg
            }
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

function sendmessagewithurl(msg, num,url) {

}

function getdate() {
    let date = new Date();
    let offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    date = date.toISOString().split('T')[0];
    return date;
}

async function getteamresults(teamname, qs,num) {  
    let db = await getDB(DBNAME[num]);
    let results = await db.collection("Teams").findOne({ teamname: teamname }).catch(err => { console.log(err) });
    if (results && results.leagueresult) {
        return results.leagueresult;
    }
    else {
        return getonlineteamresults(teamname, qs, num);
    }
}

async function getonlineteamresults(teamname, qs,num) {
    let team = await getid(teamname);
    team = JSON.parse(team.body);
    if (team.response[0]) {
        let ans = ` ${teamname} results 💬 ` + "\n";
        let id = team.response[0].team.id;
        qs.team = id;
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
        let list = data.response;
        for (let entry of list) {
            let hometeamname = entry.teams.home.name;
            let awayteamname = entry.teams.away.name;
            let hometeamgoal = entry.goals.home;
            let awayteamgoal = entry.goals.away;
            let leaguename = entry.league.name;
            let time = entry.fixture.date;
            let resulttime = getresulttime(time);
            ans += `${hometeamname} : ${hometeamgoal}  ${awayteamname} : ${awayteamgoal} `;
            ans += "\n";
            ans += `League : ${leaguename}`;
            ans += "\n";
            ans += `date : ${resulttime} 🕰️`;
            ans += "\n\n";
        }
        ans += "\n\n\n";
        teamname = teamname.toLowerCase();
        let myquery = { teamname: teamname };
        let newvalues;
        newvalues = { $set: { leagueresult: ans } };
        storedata("Teams", myquery, newvalues, num);
        return ans;
    }
    else {
        return `Couldnt find the team's results 😕 . `;
    }
}

async function getteamfixtures(teamname, qs, num) {
    let db = await getDB(DBNAME[num]);
    let results = await db.collection("Teams").findOne({ teamname: teamname }).catch(err => { console.log(err) });
    if (results && results.leaguefixtures) {
        return results.leaguefixtures;
    }
    else {
        return getonlineteamfixtures(teamname, qs, num);
    }
}

async function getonlineteamfixtures(teamname, qs,num) {
    let team = await getid(teamname);
    team = JSON.parse(team.body);
    if (team.response[0]) {
        let ans = ` ${teamname} fixtures 🗓️ ` + "\n";
        let id = team.response[0].team.id;
        qs.team = id;
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
        let list = data.response;
        for (let entry of list) {
            let hometeamname = entry.teams.home.name;
            let awayteamname = entry.teams.away.name;
            let leaguename = entry.league.name;
            let time = entry.fixture.date;
            let timestring = getfixturetime(time);
            ans += `League : ${hometeamname} 🆚  ${awayteamname} `;
            ans += "\n";
            ans += `${leaguename}`;
            ans += "\n";
            ans += `date : ${timestring} 🗓️`;
            ans += "\n\n";
        }
        ans += "\n\n\n";
        teamname = teamname.toLowerCase();
        let myquery = { teamname: teamname };
        let newvalues;
        newvalues = { $set: { leaguefixtures: ans } };
        await storedata("Teams", myquery, newvalues, num);
        return ans;
    }
    else {
        return `Couldnt find the team's fixtures 😟 . `;
    }
}

async function getteamstats(teamname, qs,num) {
    let db = await getDB(DBNAME[num]);
    teamname = teamname.toLowerCase();
    console.log(teamname);
    let results = await db.collection("Teams").findOne({ teamname: teamname }).catch(err => { console.log(err) });
    if (results && results.stats) {
        return results.stats;
    }
    else {
        return getonlineteamstats(teamname, qs, num);
    }
}

async function getonlineteamstats(teamname, qs,num) {
    let team = await getid(teamname);
    team = JSON.parse(team.body);
    let response = team.response;
    if (response[0]) {
        let id = response[0].team.id;
        qs.team = id;
        let options = {
            method: 'GET',
            url: 'https://v3.football.api-sports.io/teams/statistics',
            qs: qs,
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': key
            }
        }
        let req = util.promisify(request);
        let rawbody = await req(options);
        let data = JSON.parse(rawbody.body);
        let statz = data.response;
        let teamname = statz.team.name;
        let gameplayed = statz.fixtures.played.total;
        let homewins = statz.fixtures.wins.home;
        let awaywins = statz.fixtures.wins.away;
        let homedraws = statz.fixtures.draws.home;
        let awaydraws = statz.fixtures.draws.away;
        let homelosses = statz.fixtures.loses.home;
        let awaylosses = statz.fixtures.loses.away;
        let totalhomegoals = statz.goals.for.total.home;
        let totalawaygoals = statz.goals.for.total.away;
        let totalgoals = statz.goals.for.total.total;
        let avggoal = statz.goals.for.average.total;
        let concendedhome = statz.goals.against.total.home;
        let concendedaway = statz.goals.against.total.away;
        let concendedtotal = statz.goals.against.total.total;
        let concendedavg = statz.goals.against.average.total;
        let longestwinstreak = statz.biggest.streak.wins;
        let longestdrawstreak = statz.biggest.streak.draws;
        let longestlossstreak = statz.biggest.streak.loses;
        let homecleansheets = statz.clean_sheet.home;
        let awaycleansheets = statz.clean_sheet.away;
        let totalpenalties = statz.penalty.total;
        let penaltiesscored = statz.penalty.scored.total;
        let penaltiesmissed = statz.penalty.missed.total;
        let lineups = statz.lineups;
        let lineup = lineups[0];
        for (let lineupz of lineups) {
            if (lineupz.played > lineup.played)
                lineup = lineupz;
        }
        let ans = "";
        ans += ` ${teamname} stats 📈 📊`;
        ans += "\n\n";
        if (qs.league) {
            let leaguename = statz.league.name;
            let countryname = statz.league.country;
            ans += `Country : ${countryname}`;
            ans += "\n\n";
            ans += `League : ${leaguename}`;
            ans += "\n\n";
        }
        ans += `Number of games played : ${gameplayed}`;
        ans += "\n\n";
        ans += `Home wins : ${homewins} 🏆 `;
        ans += "\n\n";
        ans += `Away wins : ${awaywins} 🏆 `;
        ans += "\n\n";
        ans += `Home draws : ${homedraws} 😶`;
        ans += "\n\n";
        ans += `Away draws : ${awaydraws} 😶 `;
        ans += "\n\n";
        ans += `Home losses : ${homelosses} 💔`;
        ans += "\n\n";
        ans += `Away losses : ${awaylosses} 💔`;
        ans += "\n\n";
        ans += `Goals scored home : ${totalhomegoals} ⛹️`;
        ans += "\n\n";
        ans += `Goals scored away : ${totalawaygoals} ⛹️`;
        ans += "\n\n";
        ans += `Total number of goals scored : ${totalgoals} ⛹️`;
        ans += "\n\n";
        ans += `Average goals : ${avggoal}`;
        ans += "\n\n";
        ans += `Total penalties taken : ${totalpenalties} 🥅`;
        ans += "\n\n";
        ans += `Total penalties scored : ${penaltiesscored} 🎯`;
        ans += "\n\n";
        ans += `Total penalties missed : ${penaltiesmissed} 💔`;
        ans += "\n\n";
        ans += `Cleansheets at home : ${homecleansheets}`;
        ans += "\n\n";
        ans += `Cleansheets away : ${awaycleansheets}`;
        ans += "\n\n";
        ans += ` Goals conceded at home : ${concendedhome} 💔`;
        ans += "\n\n";
        ans += `Goals conceded away : ${concendedaway} 💔`;
        ans += "\n\n";
        ans += `Total goals conceded : ${concendedtotal} 💔`;
        ans += "\n\n";
        ans += `Average goals conceded : ${concendedavg} 💔`;
        ans += "\n\n";
        ans += `Longest winning streak : ${longestwinstreak} 💁‍♂️`;
        ans += "\n\n";
        ans += `Longest drawing streak : ${longestdrawstreak} 💔`;
        ans += "\n\n";
        ans += `Longest lossing streak : ${longestlossstreak}`;
        ans += "\n\n";
        ans += (lineup) ? `Preffered formation : ${lineup.formation} 💁‍♂️` : "";
        ans += "\n\n\n";
        ans = ans.replace(/null/g, "0");
        teamname = teamname.toLowerCase();
        let myquery = { teamname: teamname };
        let newvalues = { $set: { stats: ans } };
        storedata("Teams", myquery, newvalues, num);
        return ans;
    }
    else {
        return `Couldnt find the team's stats 🙁. `;
    }
}

async function getplayerstats(qs,num) {
    let db = await getDB(DBNAME[num]);
    let name = qs.search;
    name = name.toLowerCase();
    console.log(name);
    let results = await db.collection("Players").findOne({ playername: name }).catch(err => { console.log(err) });
    if (results && results.stats) {
        return results.stats;
    }
    else {
        return getonlineplayerstats(qs, num);
    }
}

async function getonlineplayerstats(qs,num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/players',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    let playerprofile = data.response[0];
    if (playerprofile) {
        let firstname = playerprofile.player.firstname;
        let lastname = playerprofile.player.lastname;
        let age = playerprofile.player.age;
        let nationality = playerprofile.player.nationality;
        let height = playerprofile.player.height;
        let weight = playerprofile.player.weight;
        let teamname = playerprofile.statistics[0].team.name;
        let appearances = playerprofile.statistics[0].games.appearences;
        let minutes = playerprofile.statistics[0].games.minutes;
        let totalshots = playerprofile.statistics[0].shots.total;
        let ontarget = playerprofile.statistics[0].shots.on;
        let goals = playerprofile.statistics[0].goals.total;
        let assists = playerprofile.statistics[0].goals.assists;
        let saves = playerprofile.statistics[0].goals.saves;
        let totalpasses = playerprofile.statistics[0].passes.total;
        let keypasses = playerprofile.statistics[0].passes.key;
        let passaccuracy = playerprofile.statistics[0].passes.accuracy;
        let totaltackles = playerprofile.statistics[0].tackles.total;
        let blocks = playerprofile.statistics[0].tackles.blocks;
        let interception = playerprofile.statistics[0].tackles.interceptions;
        let totalduels = playerprofile.statistics[0].duels.total;
        let duelswon = playerprofile.statistics[0].duels.won;
        let attempteddribbles = playerprofile.statistics[0].dribbles.attempts;
        let succesfuldribles = playerprofile.statistics[0].dribbles.success;
        let foulsdrawn = playerprofile.statistics[0].fouls.drawn;
        let foulscommited = playerprofile.statistics[0].fouls.committed;
        let yellowcard = playerprofile.statistics[0].cards.yellow;
        let redcards = playerprofile.statistics[0].cards.red + playerprofile.statistics[0].cards.yellowred;
        let penaltywon = playerprofile.statistics[0].penalty.won;
        let penaltycommited = playerprofile.statistics[0].penalty.commited;
        let penaltyscored = playerprofile.statistics[0].penalty.scored;
        let penaltymissed = playerprofile.statistics[0].penalty.missed;
        let penaltysaved = playerprofile.statistics[0].penalty.saved;
        let ans = "Player stats 📊 📈 \n";
        ans += `First Name : ${firstname}`;
        ans += "\n\n";
        ans += `Last Name : ${lastname}`;
        ans += "\n\n";
        ans += `Age : ${age}`;
        ans += "\n\n";
        ans += `Nationality : ${nationality}`;
        ans += "\n\n";
        ans += `Height : ${height} 🧍`;
        ans += "\n\n";
        ans += `Weight : ${weight} ⚖️`;
        ans += "\n\n";
        ans += `Team : ${teamname} `;
        ans += "\n\n";
        ans += `Total number of appearances : ${appearances}`;
        ans += "\n\n";
        ans += `Total minutes played : ${minutes} ⏳ ⛹️ `;
        ans += "\n\n";
        ans += `Total number of shots : ${totalshots} ⛹️`;
        ans += "\n\n";
        ans += `Total number of shots on target : ${ontarget} 🎯 `;
        ans += "\n\n";
        ans += `Total goals : ${goals} 🥅 `;
        ans += "\n\n";
        ans += `Assists : ${assists} 💫 💫 `;
        ans += "\n\n";
        ans += `Goal Saves : ${saves} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Total passes made : ${totalpasses} ⛹️`;
        ans += "\n\n";
        ans += `Key Passes : ${keypasses} 💫 ⛹️ `;
        ans += "\n\n";
        ans += `Pass accuracy : ${passaccuracy} % 🎯`;
        ans += "\n\n";
        ans += `Total number of tackles made : ${totaltackles} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Total blocks made : ${blocks} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Total number of inception : ${interception} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Total Duels made: ${totalduels} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Total Duels won : ${duelswon} 🛡️ 🛡️ `;
        ans += "\n\n";
        ans += `Attempted dribbles : ${attempteddribbles} ⛹️ ⛹️`;
        ans += "\n\n";
        ans += `Succesful dribles : ${succesfuldribles} 💫 ⛹️ `;
        ans += "\n\n";
        ans += `Fouls players has drawn : ${foulsdrawn}`;
        ans += "\n\n";
        ans += `Fouls players has committed : ${foulscommited} 🚨 🚨 `;
        ans += "\n\n";
        ans += `Yellow cards : ${yellowcard} 🟨 `;
        ans += "\n\n";
        ans += `Red cards : ${redcards} 🟥 `;
        ans += "\n\n";
        ans += `Number of penalties won : ${penaltywon} 💫 🥅 `;
        ans += "\n\n";
        ans += `Number of penalties commited : ${penaltycommited} 🚨 🚨 `;
        ans += "\n\n";
        ans += `Number of penalties scored : ${penaltyscored} 🥅 `;
        ans += "\n\n";
        ans += `Number of penalties missed : ${penaltymissed} 😞 `;
        ans += "\n\n";
        ans += `Number of penalties saved : ${penaltysaved} 🛡️ 🛡️ `;
        ans += "\n\n\n";
        ans = ans.replace(/null/g, "0");
        let name = qs.search;
        name = name.toLowerCase();
        let myquery = { playername: name };
        let newvalues = { $set: { stats: ans } };
        storedata("Players", myquery, newvalues, num);
        return ans;
    }
    else {
        return `Cant find the players name 🙁 . Ensure the spellings are correct 🤗. `;
    }
}

async function leaguereds(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.red) {
        return results.red;
    }
    else {
        return getonlineleguereds(qs, num);
    }
}

async function getonlineleguereds(qs,num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/players/topredcards',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    let list = data.response;
    let ans = `Red cards 🟥 🟥 `+"\n";
    let count = 1;
    for (let entry of list) {
        let name = entry.player.name;
        let red = entry.statistics[0].cards.red;
        red = (red == null) ? 0 : red;
        ans += `${count++}. ${name} has ${red} red cards 😲 `;
        ans += "\n\n";
    }
    ans += "\n\n\n";
    let id = qs.league;
    let myquery = { league: id };
    let newvalues = { $set: { red: ans } };
    storedata("League", myquery, newvalues, num);
    return ans;
}

async function leagueyellows(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.yellow) {
        return results.yellow;
    }
    else {
        return getonlineleagueyellows(qs, num);
    }
}

async function getonlineleagueyellows(qs,num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/players/topyellowcards',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    let list = data.response;
    let ans = `Yellow cards 🟨 🟨 ` + "\n";
    let count = 1;
    for (let entry of list) {
        let name = entry.player.name;
        let yellows = entry.statistics[0].cards.yellow;
        yellows = (yellows == null) ? 0 : yellows;
        ans += `${count++}. ${name} has ${yellows} yellow cards 😐 `;
        ans += "\n\n";
    }
    ans += "\n\n\n";
    let id = qs.league;
    let myquery = { league: id };
    let newvalues = { $set: { yellow: ans } };
    storedata("League", myquery, newvalues, num);
    return ans;
}

async function leagueassists(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.assists) {
        return results.assists;
    }
    else {
        return getonlineleagueassists(qs, num);
    }
}

async function getonlineleagueassists(qs,num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/players/topassists',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    let list = data.response;
    let ans = `Assists 💫 💫 ` + "\n";
    let count = 1;
    for (let entry of list) {
        let name = entry.player.name;
        let assists = entry.statistics[0].goals.assists;
        assists = (assists == null) ? 0 : assists;
        ans += `${count++}. ${name} has ${assists} assists 🤩 🤩 `;
        ans += "\n\n";
    }
    ans += "\n\n\n";
    let id = qs.league;
    let myquery = { league: id };
    let newvalues = { $set: { assists: ans } };
    storedata("League", myquery, newvalues, num);
    return ans;
}

async function leaguetopscorers(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.topscorers) {
        return results.topscorers;
    }
    else {
        return getonlineleaguetopscorers(qs, num);
    }
}

async function getonlineleaguetopscorers(qs, num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/players/topscorers',
        qs: qs,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    let data = JSON.parse(rawbody.body);
    let list = data.response;
    let ans = `Top scorers 💫 💫 `+"\n";
    let count = 1;
    for (let entry of list) {
        let name = entry.player.name;
        let goals = entry.statistics[0].goals.total;
        let assists = entry.statistics[0].goals.assists;
        assists = (assists == null) ? 0 : assists;
        ans += `${count++}. ${name} ${goals} goals and ${assists} assists 🤩 `;
        ans += "\n\n";
    }
    ans += "\n\n\n";
    let id = qs.league;
    let myquery = { league: id };
    let newvalues = { $set: { topscorers: ans } };
    storedata("League", myquery, newvalues, num);
    return ans;
}

async function grouptables(qs, num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("groups").findOne({ league: id }).catch(err => { console.log(err) });
    if (results) {
        let names = Object.getOwnPropertyNames(results);
        for (let name of names) {
            if (name != 'groups' && name != '_id') sendmessage(results[name], num);
        }
    }
    else {
        await getgrouptableonline(qs, num);
    }
}

async function getgrouptableonline(qs, num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/standings',
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
        let groups = data.response[0].league.standings;
        for (const teamsstats of groups) {
            let groupname = teamsstats[0].group;
            let ans = `${groupname} 📌 📌 
Rank    GD    Points  Team `;
            for (let team of teamsstats) {
                let name = team.team.name;
                if (name.includes("United")) {
                    name = name.replace("United", "Utd")
                }
                let gd = team.goalsDiff;
                let gdlength = gd.toString().length;
                console.log(gdlength);
                let points = team.points;
                let pointslength = points.toString().length;
                let rank = team.rank;
                let ranklength = rank.toString().length;
                ans += "\n\n";
                ans += `${rank}`;
                let remspaces = 4 - ranklength;
                for (; remspaces > 0; remspaces--)
                    ans += "  ";
                ans += `    ${gd}`
                remspaces = 4 - gdlength;
                for (; remspaces > 0; remspaces--)
                    ans += "  ";
                ans += `  ${points}`;
                remspaces = 4 - pointslength;
                for (; remspaces > 0; remspaces--)
                    ans += "  ";
                ans += `    ${name}`;
            }
            ans += "\n";
            let id = qs.league;
            let myquery = { league: id };
            let newvalues = { $set: {} };
            newvalues["$set"][groupname] = ans;
            console.log(newvalues)
            storedata("groups", myquery, newvalues, num);
            sendmessage(ans, num);
        }
    }
    else {
        sendmessage(" 🆘  Couldnt find results 🆘 ", num);
    }
}

async function leaguetable(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.table) {
        return results.table;
    }
    else {
        return getonlineleaguetable(qs,num);
    }
}

async function getonlineleaguetable(qs,num) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/standings',
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
        let teamsstats = data.response[0].league.standings[0];
        let ans = ` Table 📌 📌 
Rank    GD    Points  Team `;
        for (let team of teamsstats) {
            let name = team.team.name;
            if (name.includes("United")) {
                name = name.replace("United", "Utd")
            }
            let gd = team.goalsDiff;
            let gdlength = gd.toString().length;
            console.log(gdlength);
            let points = team.points;
            let pointslength = points.toString().length;
            let rank = team.rank;
            let ranklength = rank.toString().length;
            ans += "\n\n";
            ans += `${rank}`;
            let remspaces = 4 - ranklength;
            for (; remspaces > 0; remspaces--)
                ans += "  ";
            ans += `    ${gd}`
            remspaces = 4 - gdlength;
            for (; remspaces > 0; remspaces--)
                ans += "  ";
            ans += `  ${points}`;
            remspaces = 4 - pointslength;
            for (; remspaces > 0; remspaces--)
                ans += "  ";
            ans += `    ${name}`;
        }
        ans += "\n\n\n";
        let id = qs.league;
        let myquery = { league: id };
        let newvalues = { $set: { table: ans } };
        storedata("League", myquery, newvalues, num);
        return ans;
    }
    else {
        return " 🆘 Couldnt find results 🆘 .";
    }
}

async function leagueresults(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.results) {
        return results.results;
    }
    else {
        return getonlineleagueresults(qs, num);
    }
}

async function getonlineleagueresults(qs,num) {
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
        let ans =` Results 📌 📌 ` + "\n";
        for (let entry of list) {
            let hometeamname = entry.teams.home.name;
            let awayteamname = entry.teams.away.name;
            let hometeamgoal = entry.goals.home;
            let awayteamgoal = entry.goals.away;
            ans += `${hometeamname} : ${hometeamgoal}  ${awayteamname} : ${awayteamgoal} ⚽ `;
            ans += "\n\n";
        }
        ans = ans.replace(/null/g, "0");
        ans += "\n\n\n";
        let id = qs.league;
        let myquery = { league: id };
        let newvalues = { $set: { results: ans } };
        storedata("League", myquery, newvalues, num);
        return ans;
    }
    else {
        return "No game results today or your spelling is wrong 😔 . ";
    }
}

async function leaguefixture(qs,num) {
    let db = await getDB(DBNAME[num]);
    let id = qs.league;
    let results = await db.collection("League").findOne({ league: id }).catch(err => { console.log(err) });
    if (results && results.fixtures) {
        return results.fixtures;
    }
    else {
        return getonlineleaguefixture(qs, num);
    }
}

async function getonlineleaguefixture(qs,num) {
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
        let ans = ` Fixtures 📌 📌 ` + "\n\n";
        for (let entry of list) {
            let hometeamname = entry.teams.home.name;
            let awayteamname = entry.teams.away.name;
            let hometeamgoal = entry.goals.home;
            let awayteamgoal = entry.goals.away;
            let time = entry.fixture.status.elapsed;
            time = (time == null) ? `( Not started )` : `(${time} minutes)`;
            ans += `${hometeamname} : ${hometeamgoal}  ${awayteamname} : ${awayteamgoal} `;
            ans += "\n";
            ans += `    ${time} ⌚     `;
            ans += "\n\n";
        }
        ans = ans.replace(/null/g, "0");
        ans += "\n\n\n";
        let id = qs.league;
        let myquery = { league: id };
        let newvalues = { $set: { fixtures: ans } };
        storedata("League", myquery, newvalues, num);
        return ans;
    }
    else {
        return "No fixtures today or your spellings are wrong 😔 .";
    }
}

async function getid(name) {
    let options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/teams',
        qs: { search: name },
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': key
        }
    };
    let req = util.promisify(request);
    let rawbody = await req(options);
    return rawbody;
}

function getfixturetime(rawtime) {
    let timezone = "Africa/Nairobi";
    let time = moment(rawtime).tz(timezone).format('YYYY-MM-DD HH:mm');
    let date = new Date();
    let offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    let lastweekday = date.setDate(date.getDate() + 6);
    let datetime = new Date(time);
    offset = datetime.getTimezoneOffset();
    datetime = new Date(datetime.getTime() - (offset * 60 * 1000));
    let today = new Date();
    if (today.getDate() == datetime.getDate() && today.getMonth() == datetime.getMonth()) {
        let minutes = datetime.getMinutes();
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        let response = `Today ${datetime.getHours()}:${minutes}`;
        return response;
    }
    if (datetime < lastweekday) {
        let minutes = datetime.getMinutes();
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        let response = `${getdayofweek(datetime.getDay())} ${datetime.getHours()}:${minutes} `;
        return response;
    }
    return time;
}

function getresulttime(rawtime) {
    let timezone = "Africa/Nairobi";
    let time = moment(rawtime).tz(timezone).format('YYYY-MM-DD HH:mm');
    let date = new Date();
    let offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    let lastweekday = date.setDate(date.getDate() - 6);
    let datetime = new Date(time);
    offset = datetime.getTimezoneOffset();
    datetime = new Date(datetime.getTime() - (offset * 60 * 1000));
    let today = new Date();
    if (today.getDate() == datetime.getDate() && today.getMonth() == datetime.getMonth()) {
        let minutes = datetime.getMinutes();
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        let response = `Today ${datetime.getHours()}:${minutes}`;
        return response;
    }
    if (datetime > lastweekday) {
        let minutes = datetime.getMinutes();
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        let response = `${getdayofweek(datetime.getDay())} ${datetime.getHours()}:${minutes} `;
        return response;
    }
    return time;
}

function getdayofweek(dayofweek) {
    switch (dayofweek) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday'
        case 3:
            return 'Wednesday'
        case 4:
            return 'Thursday'
        case 5:
            return 'Friday'
        case 6:
            return 'Saturday'
    }
}

async function storedata(table, query, values, num) {
    let db = await getDB(DBNAME[num]);
    await db.collection(table).updateOne(query, values, { upsert: true });
}

module.exports.leaguefixture = leaguefixture;
module.exports.leagueresults = leagueresults;
module.exports.leaguetable = leaguetable;
module.exports.leaguetopscorers = leaguetopscorers;
module.exports.leagueyellows = leagueyellows;
module.exports.leagueassists = leagueassists;
module.exports.leaguereds = leaguereds;
module.exports.getplayerstats = getplayerstats;
module.exports.getteamstats = getteamstats;
module.exports.getteamfixtures = getteamfixtures;
module.exports.getdate = getdate;
module.exports.getteamresults = getteamresults;
module.exports.sendmessage = sendmessage;
module.exports.sendmessagewithurl = sendmessagewithurl;
module.exports.getdate = getdate;
module.exports.getfixturetime = getfixturetime;
module.exports.grouptables = grouptables;
module.exports.getdb = getDB;
