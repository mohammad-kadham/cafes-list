const express = require("express")
const {body} = require("express-validator")

const authController = require("../controllers/auth");
const router = express.Router()

router.get("/login",authController.getLogin)
router.post("/login",[body('email').isEmail().withMessage("ENTER VALID EMAIL")],authController.postLogin)

router.get("/signup",authController.getSignup)
router.post("/signup",[
body('username').trim().notEmpty().withMessage("pleaase fill in the user name"),
body('email').isEmail().withMessage("please enter correct email address"),
body('password').isLength({min:4}).withMessage("password must be at least 4 characters long")
],authController.postSignup)

router.get("/verify-email", authController.getVerifyEmail)

router.get("/logout",authController.getLogout)


module.exports =  router;