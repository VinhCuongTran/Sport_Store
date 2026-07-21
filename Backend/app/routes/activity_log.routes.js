// routes/activity_log.route.js
const express = require("express");
const router = express.Router();
const ActivityLogController = require("../controllers/activity_log.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get(
  "/",
  verifyToken,
  isAdminOrStaff,
  ActivityLogController.getAll,
);

module.exports = router;
