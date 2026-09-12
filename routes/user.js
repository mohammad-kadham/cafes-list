const userController = require("../controllers/user");
const routeAuth = require("../controllers/route-auth");

const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

router.get("/",userController.getIndex)
router.get("/cafes/add",routeAuth.auth,userController.getAdd)
router.post("/cafes/add", [
    body("title").trim().notEmpty().withMessage("insert a cafe's name"),
    body("location").trim().notEmpty().withMessage("insert a location"),
    body("city").trim().notEmpty().withMessage("insert a city"),
    body("openingHours").trim().notEmpty().withMessage("insert opening hours"),
], userController.postAdd)
router.get("/cafes/filter",routeAuth.onlyUser,userController.getFiltered)

router.get("/rate/:cafeId",routeAuth.onlyUser,userController.getRate)
router.post("/rate", routeAuth.auth, [
     body("cafe_id").isInt({ min: 1 }).withMessage("invalid cafe"),
    body("wifi").isInt({ min: 1, max: 3 }).withMessage("wifi rating must be between 1 and 3"),
    body("outlet").isInt({ min: 1, max: 3 }).withMessage("outlet rating must be between 1 and 3"),
    body("seat").isInt({ min: 1, max: 3 }).withMessage("seat rating must be between 1 and 3"),
    body("service").isInt({ min: 1, max: 3 }).withMessage("service rating must be between 1 and 3"),
    body("noise").isInt({ min: 1, max: 3 }).withMessage("noise rating must be between 1 and 3"),
    body("price").isInt({ min: 1, max: 3 }).withMessage("price rating must be between 1 and 3"),
], userController.postRate)

router.get("/details/:cafeId",routeAuth.onlyUser,userController.getDetail)

router.get("/api/geocode/",userController.getCity)

module.exports = router;
