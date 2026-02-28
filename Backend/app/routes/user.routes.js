const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

//Chỉ Admin/Staff mới được xem danh sách TẤT CẢ người dùng
router.get("/", verifyToken, isAdminOrStaff, userController.findAll);

//Đăng nhập mới được xem và cập nhật thông tin cá nhân
router.get("/:id", verifyToken, userController.findOne);
router.put("/:id", verifyToken, upload.single("avatar"), userController.update);

//Chỉ Admin/Staff mới có quyền xóa tài khoản (khóa tài khoản)
router.delete("/:id", verifyToken, isAdminOrStaff, userController.delete);

module.exports = router;
