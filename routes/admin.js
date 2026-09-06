const adminController = require("../controllers/admin");
const routeAuth = require("../controllers/route-auth");

const express = require("express")

const router = express.Router();

router.get("/admin",adminController.getAdminLogin)
router.post("/admin",adminController.postLoginAdmin)

router.get("/dashboard",routeAuth.auth,adminController.getDashBoard)

router.post("/admin/cafe/:cafeId",adminController.approveCafe)
router.post("/admin/cafe/delete/:cafeId",adminController.deleteCafe)


module.exports = router;