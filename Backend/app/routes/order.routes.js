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
// Thêm 2 route này vào file order.routes.js
// Admin lấy tất cả đơn hàng
router.get("/", verifyToken, isAdminOrStaff, orderController.getAllOrders);
// Admin xem chi tiết 1 đơn hàng (có thể dùng chung với User nếu muốn, ở đây set cho Admin/Staff trước)
router.get("/:id", verifyToken, orderController.getOrderById);

module.exports = router;
