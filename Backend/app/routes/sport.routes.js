const express = require("express");
const router = express.Router();
const sportController = require("../controllers/sport.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

//Ai cũng xem được môn thể thao
router.get("/", sportController.findAll);
router.get("/:id", sportController.findOne);

//Chỉ Admin/Staff mới được Thêm, Sửa, Xóa
router.post("/", verifyToken, isAdminOrStaff, sportController.create);
router.put("/:id", verifyToken, isAdminOrStaff, sportController.update);
router.delete("/:id", verifyToken, isAdminOrStaff, sportController.delete);

module.exports = router;
