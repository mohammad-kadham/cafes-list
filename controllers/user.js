const { validationResult } = require("express-validator");
const Cafes = require("../model/cafes");
const Ratings = require("../model/ratings");
const path = require("path");


exports.getIndex = (req, res, next) => {

    try {

        const fetcheddata = Cafes.fetchAll(req.session.city)
        res.render("user/index", {
            cafes: fetcheddata,
            sortQuery: ''
        })
    } catch (error) {
        const err = new Error(error)
        err.httpStatusCode = 500;
        next(err)
    }

}

exports.getAdd = (req, res) => {

    res.render('user/add-cafe', { err: req.flash("errorMsg") })
}

exports.postAdd = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors);

        req.flash("errorMsg", errors.array()[0].msg)
        return res.redirect("/cafes/add")
    }

    if (!req.file) {
        req.flash("errorMsg", "please upload an image")
        return res.redirect("/cafes/add")
    }

    const imgUrl = "/images/" + req.file.filename
    const { title, location, city, openingHours } = req.body
    const cafe = new Cafes(null, title, location, city, openingHours, imgUrl)
    cafe.save()
    res.redirect("/")
}

exports.getFiltered = (req, res) => {
    const sortQuery = req.query.sort;

    try {
        if (sortQuery) {

            const cafes = Cafes.sort(sortQuery,req.session.city)
            return res.render("user/index", {
                cafes: cafes,
                sortQuery
            });
        }
        res.redirect("/")
    } catch (error) {
        console.log(error);

        next(error)
    }
}


exports.getRate = (req, res) => {


    try {
        const cafeId = Number(req.params.cafeId);
        if(cafeId){

            const fetchedCafe = Cafes.fetchById(cafeId)
           return res.render("user/rate", {
                cafe: fetchedCafe
            })
        }
          res.redirect("/")
    } catch (error) {
        console.log(error);
        
        next(error)
    }
}

exports.postRate = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errorMsg", errors.array()[0].msg);
        return res.redirect("back"); // sends them back to the rating form they came from
    }

    const userId = req.session.user.id;
    const cafeId = req.body.cafe_id;
    const wifiSpeed = req.body.wifi;
    const seatComfort = req.body.seat;
    const service = req.body.service;
    const noiseLevel = req.body.noise;
    const prices = req.body.price;
    const outletCount = req.body.outlet;

    const rating = new Ratings(null, userId, cafeId, wifiSpeed, outletCount, seatComfort, service, noiseLevel, prices, null);
    rating.save();
    res.redirect("/");
}

exports.getDetail = (req, res) => {
    const cafeId = req.params.cafeId;
    const cafe = Cafes.fetchById(cafeId)
    
    res.render("user/detail", { cafe, user: req.session.user, isAuthentacted: req.session.user.isLogin })
}


exports.getCity = async (req, res) => {
    const { lat, lon, defaultCity } = req.query;
   

    try {

        let city;

        if (lat && lon) {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
                { headers: { "User-Agent": "cafeslist/1.0" } }
            );
            const dataJson = await response.json();
            city = dataJson.address.city
                || dataJson.address.town
                || dataJson.address.village
                || dataJson.address.county
                || "Bangkok";
        } else {
            city = defaultCity
        }

        req.session.city = city;


        return req.session.save(err => {
            if (err) console.log(err);
            res.json({ city });
        });


        res.json({ city: req.session.city });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not determine city" });
    }
};