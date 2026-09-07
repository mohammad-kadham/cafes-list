const path = require("path")
const db = require("./database")

//_____fields________
// title — cafe name
//  location — at minimum a text address; 
//city - text of city (need to use api to retrive the names)
// openingHours — text or structured (e.g. "8am–8pm" or per-day JSON)
db.exec(`
  CREATE TABLE IF NOT EXISTS cafes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    location TEXT,
    city TEXT,
    openingHours TEXT,
    imageUrl TEXT,
    approve INTEGER DEFAULT 0,
    avgRating INTEGER,
    ratingCount INTEGER,
    avgWifiSpeed INTEGER,
    avgOutletCount INTEGER,
    avgSeatComfort INTEGER,
    avgService INTEGER,
    avgNoiseLevel INTEGER,
    avgPrices INTEGER
  )
`);

module.exports = class Cafes {

    constructor(id, title, location, city, openingHours, imageUrl) {


        this.id = id;
        this.title = title;
        this.location = location;
        this.city = city;
        this.openingHours = openingHours;
        this.imageUrl = imageUrl;



    }
    save() {

        const insert = db.prepare("INSERT INTO cafes(title,location,city,openingHours,imageUrl) VALUES(?,?,?,?,?)");

        insert.run(this.title, this.location, this.city, this.openingHours, this.imageUrl);
    }
    static fetchById(id) {
        const cafe = db.prepare("SELECT * FROM cafes WHERE id=?").get(id);
        if (!cafe) {
            return res.status(404).send("Cafe not found");
        }
        return cafe
    }
    static fetchSubmitCafes() {
        const cafes = db.prepare("SELECT * FROM cafes WHERE approve =0").all()
        return cafes
    }
    static fetchAll(city) {
        //THIS WILL BRING CAFES BASED ON AVG RATING
       
        
        const allCafes = db.prepare("SELECT * FROM cafes WHERE approve =1 AND city =? ORDER BY avgRating DESC").all(city);
        return allCafes

    }
    static approveCafe(id) {
        db.prepare("UPDATE cafes SET approve =1 WHERE id=?").run(id)
    }
    static sort(sort,city) {
        const allowedColumns = [
            "avgWifiSpeed", "avgOutletCount", "avgSeatComfort",
            "avgService", "avgNoiseLevel", "avgPrices", "ratingCount"
        ];

        const sortColumn = allowedColumns.includes(sort) ? sort : "avgRating";
 console.log("city: ",city);
        return db.prepare(
            `SELECT * FROM cafes WHERE approve = 1 AND city =? ORDER BY  ${sortColumn} DESC, avgRating DESC`
        ).all(city);
    }
    static deleteCafe(id) {
        db.prepare("DELETE  FROM cafes WHERE id =?").run(id)
    }
}