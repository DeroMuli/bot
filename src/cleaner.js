let MongoClient = require("mongodb").MongoClient;
let url =
  "mongodb+srv://hekaya:muli@cluster0.gjt5p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

function cleaner() {
  console.log("cleaning started");
  setInterval(async () => {
    await deleteteamtable();
    await deleteLeagueTable();
    await deletePlayerTable();
  }, 3600 * 1000);
}

async function deleteteamtable() {
  let client = await MongoClient.connect(url).catch((err) => {
    console.log(err);
  });
  let db = client.db("leagues");
  await db.collection("Teams").drop();
  let compdb = client.db("Competitons");
  await compdb.collection("Teams").drop();
  let shortdb = client.db("Short");
  await shortdb.collection("Teams").drop();
  let gameweekdb = client.db("GAMEWEEK");
  await gameweekdb.collection("Teams").drop();
}

async function deleteLeagueTable() {
  let client = await MongoClient.connect(url).catch((err) => {
    console.log(err);
  });
  let db = client.db("leagues");
  await db.collection("League").drop();
  let compdb = client.db("Competitons");
  await compdb.collection("League").drop();
  let shortdb = client.db("Short");
  await shortdb.collection("League").drop();
}

async function deletePlayerTable() {
  let client = await MongoClient.connect(url).catch((err) => {
    console.log(err);
  });
  let db = client.db("leagues");
  await db.collection("Players").drop();
  let compdb = client.db("Competitons");
  await compdb.collection("Players").drop();
  let shortdb = client.db("Short");
  await shortdb.collection("Players").drop();
}

module.exports.cleaner = cleaner;
