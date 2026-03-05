const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

// Ai cũng có thể lấy danh sách voucher (có thể để user xem voucher đang có)
router.get("/", voucherController.findAll);
router.get("/:id", voucherController.findOne);

// Chỉ Admin/Staff mới được Thêm, Sửa, Xóa
router.post("/", verifyToken, isAdminOrStaff, voucherController.create);
router.put("/:id", verifyToken, isAdminOrStaff, voucherController.update);
router.delete("/:id", verifyToken, isAdminOrStaff, voucherController.delete);

module.exports = router;
