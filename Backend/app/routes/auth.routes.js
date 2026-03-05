const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// BỔ SUNG DÒNG NÀY ĐỂ MỞ API REFRESH TOKEN
router.post("/refresh-token", authController.refreshToken);

module.exports = router;