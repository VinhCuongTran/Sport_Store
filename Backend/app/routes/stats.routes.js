const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/", verifyToken, isAdminOrStaff, statsController.getOverview);
router.get("/filtered", verifyToken, isAdminOrStaff, statsController.getFilteredStats);
// --- THÊM ROUTE NÀY ---
router.get(
  "/inventory-logs",
  verifyToken,
  isAdminOrStaff,
  statsController.getInventoryLogs,
);

module.exports = router;
