var mysql = require("mysql");

//
//  The connection needed for the database
//
const fs = require('fs');
const path = require('path');
const keyPath = path.join(__dirname, 'mySQLkeys.json');
let keys = null;
if (fs.existsSync(keyPath)) {
    // this file is only found on local... 
    // it will make heroku vomit not having it, 
    // but we don't need it since we pull the keys from env
    keys = require(keyPath);
}
/*
module.exports = mysql.createConnection({
    host: process.env.JAWSDB_host || keys.host,
    port: process.env.JAWSDB_port || keys.port,
    user: process.env.JAWSDB_user || keys.user,
    password: process.env.JAWSDB_password || keys.password,
    database: process.env.JAWSDB_database || keys.database
});*/

module.exports = mysql.createPool({
    connectionLimit : 100, //important
    host: process.env.JAWSDB_host || keys.host,
    port: process.env.JAWSDB_port || keys.port,
    user: process.env.JAWSDB_user || keys.user,
    password: process.env.JAWSDB_password || keys.password,
    database: process.env.JAWSDB_database || keys.database,
    debug : false
});