
const db = require("./database")


db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT,
    userEmail TEXT UNIQUE,
    password TEXT,
    city VARCHAR(150),
    isVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    isAdmin INTEGER DEFAULT 0

    )
    `)

module.exports = class Users {
    constructor(id, userName, userEmail, password,verificationToken) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.password = password;
        this.verificationToken = verificationToken;
    }

    save() {

        const insert = db.prepare("INSERT INTO users (userName,userEmail,password,verificationToken) VALUES(?,?,?,?)")
        insert.run(this.userName, this.userEmail, this.password,this.verificationToken)
    }
    static findUser(email) {
        return db.prepare("SELECT * FROM users WHERE userEmail=? ").get(email)
    }
    static findById(id) {
        return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    }
    static findUserByToken(token) {
        return db.prepare("SELECT * FROM users WHERE verificationToken = ?").get(token);
    }
    static verfiy(id){
         return db.prepare("UPDATE users SET isVerified = 1, verificationToken = NULL WHERE id = ?").run(id);
    }

}