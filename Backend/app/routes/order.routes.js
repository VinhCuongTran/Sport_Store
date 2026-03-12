const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");
router.post("/", verifyToken, orderController.createOrder);
router.get("/user/:userId", verifyToken, orderController.getUserOrders);
router.put(
  "/:id/status",
  verifyToken,
  isAdminOrStaff,
  orderController.updateOrderStatus,
);
router.get("/", verifyToken, isAdminOrStaff, orderController.getAllOrders);
router.get("/:id", verifyToken, orderController.getOrderById);
router.put("/:id/cancel", verifyToken, orderController.cancelOrder);

module.exports = router;
