const Cafes = require("./cafes");
const db = require("./database")

db.exec(`CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cafe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  wifiSpeed INTEGER NOT NULL,
  outletCount INTEGER NOT NULL,
  seatComfort INTEGER NOT NULL,
  service INTEGER NOT NULL,
  noiseLevel INTEGER NOT NULL,
  prices INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cafe_id, user_id),
  FOREIGN KEY (cafe_id) REFERENCES cafes(id)
)`)

module.exports = class Ratings {
    constructor(id, user_id, cafe_id, wifiSpeed, outletCount, seatComfort, service, noiseLevel, prices, created_at) {
        this.id = id;
        this.user_id = user_id;
        this.cafe_id = cafe_id;
        this.wifiSpeed = wifiSpeed;
        this.outletCount = outletCount;
        this.seatComfort = seatComfort;
        this.service = service;
        this.noiseLevel = noiseLevel;
        this.prices = prices;
        this.created_at = created_at;
    }

    save() {
        db.prepare(`
            INSERT INTO ratings (cafe_id, user_id, wifiSpeed, outletCount, seatComfort, service, noiseLevel, prices)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cafe_id, user_id) DO UPDATE SET
                wifiSpeed = excluded.wifiSpeed,
                outletCount = excluded.outletCount,
                seatComfort = excluded.seatComfort,
                service = excluded.service,
                noiseLevel = excluded.noiseLevel,
                prices = excluded.prices
        `).run(
            this.cafe_id, this.user_id,
            this.wifiSpeed, this.outletCount, this.seatComfort,
            this.service, this.noiseLevel, this.prices
        );

        Ratings.updateCafeRatingStats(this.cafe_id); // now actually gets called
    }

    static updateCafeRatingStats(cafeId) {
        // Step 1: get the average of each individual tier
        const stats = db.prepare(`
            SELECT
                AVG(wifiSpeed) as avgWifiSpeed,
                AVG(outletCount) as avgOutletCount,
                AVG(seatComfort) as avgSeatComfort,
                AVG(service) as avgService,
                AVG(noiseLevel) as avgNoiseLevel,
                AVG(prices) as avgPrices,
                COUNT(*) as ratingCount
            FROM ratings
            WHERE cafe_id = ?
        `).get(cafeId);

        // Step 2: combine tier averages into one overall score (out of 5)
        const tierAverages = [
            stats.avgWifiSpeed, stats.avgOutletCount, stats.avgSeatComfort,
            stats.avgService, stats.avgNoiseLevel, stats.avgPrices
        ].filter(v => v !== null); // null if no ratings yet

        const avgRating = tierAverages.length
            ? Math.round((tierAverages.reduce((a, b) => a + b, 0) / tierAverages.length / 3) * 5 * 10) / 10
            : 0;

        // Step 3: write everything back into the cafes table
        db.prepare(`
            UPDATE cafes
            SET avgRating = ?,
                ratingCount = ?,
                avgWifiSpeed = ?,
                avgOutletCount = ?,
                avgSeatComfort = ?,
                avgService = ?,
                avgNoiseLevel = ?,
                avgPrices = ?
            WHERE id = ?
        `).run(
            avgRating, stats.ratingCount,
            stats.avgWifiSpeed || 0, stats.avgOutletCount || 0, stats.avgSeatComfort || 0,
            stats.avgService || 0, stats.avgNoiseLevel || 0, stats.avgPrices || 0,
            cafeId
        );
    }
}