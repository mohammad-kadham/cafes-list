const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
require("dotenv").config();
const adminRoutes = require("./routes/admin");
const surf = require("csurf")
const flash= require("connect-flash")
const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const app = express();
const session = require("express-session");
const Users = require("./model/users");
const errorsRoute = require("./routes/error");
const store = require("connect-sqlite3")(session)
const multer = require("multer");


const storeImg = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"images")
    },
    filename:(req,file,cb)=>{
        cb(null,"image" +"-"+file.originalname)
    }
})
const fileFilter = (req,file,cb)=>{
if(file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
    cb(null,true)
}else{
    cb(null,false)
}
}

const csurfProtection = surf()
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be configured in the environment");
}

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ store: new store({ db: "session.db", dir: "./data", table: "sessions" }), saveUninitialized: false, resave: false, secret: sessionSecret }))
app.use(multer({storage:storeImg,fileFilter:fileFilter}).single("image"))

app.use(csurfProtection)
app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    const user = Users.findById(req.session.user.id)
    if (!user) {
        return next()
    }
    req.user = user;
 
   

    next()
})
app.use((req,res,next)=>{
    res.locals.ss = req.csrfToken()
    res.locals.city = req.session.city;
   res.locals.isAuthentacted = req.session.user?.isLogin;
    next()
})
app.use(flash())
app.use(userRoutes)
app.use(authRoutes)
app.use(adminRoutes)
app.use(errorsRoute)

app.use((error,req,res,next)=>{
    
    res.render("errors/500")
    
})
app.listen(3000)
