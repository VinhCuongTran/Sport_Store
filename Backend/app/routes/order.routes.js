const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Đặt hàng mới
router.post("/", orderController.createOrder);

// Lấy danh sách đơn hàng của 1 user (Lịch sử mua hàng)
router.get("/user/:userId", orderController.getUserOrders);

// Lấy chi tiết 1 đơn hàng
router.get("/:id", orderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;
