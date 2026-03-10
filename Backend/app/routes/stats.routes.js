const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/", verifyToken, isAdminOrStaff, statsController.getOverview);

module.exports = router;
