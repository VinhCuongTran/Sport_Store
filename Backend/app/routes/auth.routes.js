const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/send-otp", authController.sendOtp);
router.post("/register-with-otp", authController.registerWithOtp);
router.post("/check-exists", authController.checkExists);

module.exports = router;