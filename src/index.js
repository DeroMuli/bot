let express = require("express");
let leaguerouter = require("./league.js");
let teamrouter = require("../teamrouter.js");
let playerrouter = require("./playerrouter.js");
let liverouter = require("./liverouter.js");
let mainrouter = require("./main.js");
let coderouter = require("../shortcodes.js");
let competionsrouter = require("./competions.js");
let cleaner = require("./cleaner").cleaner;
let request = require("request");
//global variable.. used to avoid circular dependencies
global.DBNAME = [];
let port = process.env.PORT || 8080;
let app = express();
app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(express.json());
cleaner();
app.use('/', mainrouter);
app.use('/leugue', leaguerouter);
app.use('/player', playerrouter);
app.use('/live', liverouter);
app.use('/team', teamrouter);
app.use('/short', coderouter);
app.use('/competition', competionsrouter);
app.listen(port);
