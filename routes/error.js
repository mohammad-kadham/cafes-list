
const errorController = require("../controllers/errors")
const express = require("express")

const router = express.Router()

router.use(errorController.get404)


module.exports = router;