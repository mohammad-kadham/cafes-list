const Users = require("../model/users");
const crypto = require("crypto");
const { validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const { sendWelcomeEmail } = require("../utls/email")

exports.getLogin = (req, res) => {
    res.render("auth/login", { err: req.flash("errorMsg") })
}

exports.postLogin = (req, res) => {
    ///////input validation/////////
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("auth/login", { err: errors.array()[0].msg })
    }
    ////////////////////////////////////

    try {

        const user = Users.findUser(req.body.email)
        if (!user) {
            req.flash("errorMsg", "user email is not found")
            res.redirect("/login")
        }
        return bcrypt.compare(req.body.password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.user = { id: user.id, isLogin: true, username: user.userName }


                return req.session.save(err => {
                    if (!err) {
                        console.log("succssful login");

                        return res.redirect("/")
                    }
                    return res.render("errors/500")
                })
            } else {
                req.flash("errorMsg", "the password is wrong")
                return res.redirect("/login")
            }
        })

    } catch (err) {

        res.render("errors/500")
    }




}


exports.getSignup = (req, res) => {
    res.render("auth/user", { err: null, oldValues: {}, errorMsg: req.flash("errorMsg") })
}


exports.postSignup = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body
    const errors = validationResult(req)

    try {
        if (!errors.isEmpty()) {
            return res.render("auth/user", {
                err: errors.array()[0].msg,
                errorMsg: null,
                oldValues: { username, email, password: "", confirmPassword: "" }
            })
        }

        const existingUser = Users.findUser(email);
        if (existingUser) {
            req.flash("errorMsg", "Email already exists")
            return res.redirect("/signup")
        }

        if (password.trim() !== confirmPassword.trim()) {
            req.flash("errorMsg", "passwords don't match")
            return res.redirect("/signup")
        }

        const cryptedPassword = await bcrypt.hash(password, 10);
         const verificationToken = crypto.randomBytes(32).toString("hex");
        const user = new Users(null, username, email, cryptedPassword, verificationToken);
        user.save();
        
        const verifyLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`
        console.log(verifyLink);
        // send welcome email — don't let a failed email block signup
        sendWelcomeEmail(email, username, verifyLink).catch(err => {
            console.log("Failed to send welcome email:", err);
        });


        req.flash("errorMsg", "Check your email to verify your account before logging in");
        return res.redirect("/login");
    } catch (error) {
console.log(error);

        req.flash("errorMsg", "something went wrong, please try again");
        res.redirect("/signup");
    }
}

exports.getVerifyEmail = (req, res) => {
    const { token } = req.query;
    if (!token) {
        req.flash("errorMsg", "Verfication link is invalid")
        return res.redirect("/login")
    }
    const user = Users.findUserByToken(token);
    if (!user) {
        req.flash("errorMsg", "Verfication link is expired")
        return res.redirect("/login")
    }
    Users.verfiy(user.id)
    req.flash("errorMsg", "email verified! you can now log in");
    res.redirect("/login");
}

exports.getLogout = (req, res) => {
    req.session.destroy()
    res.redirect("/")
}