// routes/activity_log.route.js
const express = require("express");
const router = express.Router();
const ActivityLogController = require("../controllers/activity_log.controller");
const {
  verifyToken,
  isAdminOnly,
} = require("../middlewares/auth.middleware");

router.get(
  "/",
  verifyToken,
  isAdminOnly,
  ActivityLogController.getAll,
);

module.exports = router;
