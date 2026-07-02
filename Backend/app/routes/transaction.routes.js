const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { verifyToken, isAdminOrStaff } = require("../middlewares/auth.middleware");

// Chỉ Admin/Staff mới được xem lịch sử dòng tiền
router.get("/", verifyToken, isAdminOrStaff, transactionController.getAll);

module.exports = router;