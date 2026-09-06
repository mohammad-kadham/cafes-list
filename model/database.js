const DataBase = require("better-sqlite3")
const path = require("path")


const db = new DataBase(path.join(__dirname,"..","main.db"))

module.exports = db;