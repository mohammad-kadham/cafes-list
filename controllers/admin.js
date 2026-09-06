const Cafes = require("../model/cafes");
const Users = require("../model/users");
const bcrypt = require("bcrypt")


exports.getAdminLogin = (req, res, next) => {
    res.render('admin/login', { err: req.flash("errorMsg")[0] });
}

exports.postLoginAdmin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = Users.findUser(email);
        if (!user || !user.isAdmin) {
            req.flash("errorMsg", "invalid email");
            return res.redirect("/admin");
        }

        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            req.flash("errorMsg", "password is wrong");
            return res.redirect("/admin");
        }

        req.session.user = { id: user.id, isLogin: true, isAdmin: true };

        req.session.save(err => {
            if (err) {
                console.log(err);
                req.flash("errorMsg", "something went wrong, please try again");
                return res.redirect("/admin");
            }
            return res.redirect("/dashboard");
        });

    } catch (err) {
        console.log(err);
        req.flash("errorMsg", "error happened, please try again");
        res.redirect("/admin");
    }
}

exports.getDashBoard = (req, res) => {
    try {
        const allCafes = Cafes.fetchSubmitCafes()
        res.render("admin/dashboard", { errorMsg:req.flash("errorMsg"),user: req.user, isAuthentacted: req.session.user.isLogin, cafes: allCafes, city: req.session.city || null })
    } catch (error) {
        res.render("errors/500")
    }

}


exports.approveCafe = (req, res) => {
    try {
         const cafeId = req.params.cafeId;
      
        if (!cafeId) throw new Error("no id found")
        Cafes.approveCafe(cafeId)
        res.redirect("/dashboard")
    } catch (error) {
        console.log(error);
        req.flash("errorMsg", "could not approve cafe");
        res.redirect("/dashboard")
    }
}

exports.deleteCafe = (req, res) => {
    try {
        const cafeId = req.params.cafeId;
        if (!cafeId) throw new Error("no id found")
        Cafes.deleteCafe(cafeId)
        res.redirect("/dashboard")
    } catch (error) {
        console.log(error);
        req.flash("errorMsg", "could not delete cafe");
        res.redirect("/dashboard")
    }
}