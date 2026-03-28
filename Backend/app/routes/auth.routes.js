const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);

router.post("/check-exists", authController.checkExists);
router.post("/send-otp", authController.sendOtp);
router.post("/register-with-otp", authController.registerWithOtp);

router.post("/forgot-password/send-otp", authController.forgotPasswordSendOtp);
router.post(
  "/forgot-password/verify-otp",
  authController.forgotPasswordVerifyOtp,
);
router.post("/forgot-password/reset", authController.forgotPasswordReset);

module.exports = router;
