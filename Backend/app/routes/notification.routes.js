const express = require("express");
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // Gọi middleware xác thực của bạn

const router = express.Router();

// Sử dụng middleware để đảm bảo chỉ user đã đăng nhập mới xem được thông báo
router.get("/", authMiddleware.verifyToken, notificationController.getAll);
router.put(
  "/:id/read",
  authMiddleware.verifyToken,
  notificationController.markRead,
);

module.exports = router;
