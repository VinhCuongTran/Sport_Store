const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

// Khách hàng phải đăng nhập mới được đặt hàng và xem lịch sử
router.post("/", verifyToken, orderController.createOrder);
router.get("/user/:userId", verifyToken, orderController.getUserOrders);

// Chỉ Admin/Staff mới được duyệt/cập nhật trạng thái đơn hàng
router.put(
  "/:id/status",
  verifyToken,
  isAdminOrStaff,
  orderController.updateOrderStatus,
);

module.exports = router;
