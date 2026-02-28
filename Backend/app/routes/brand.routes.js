const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

//Ai cũng xem được danh sách thương hiệu
router.get("/", brandController.findAll);
router.get("/:id", brandController.findOne);

//Chỉ Admin/Staff mới được Thêm, Sửa, Xóa thương hiệu
router.post(
  "/",
  verifyToken,
  isAdminOrStaff,
  upload.single("logo"),
  brandController.create,
);
router.put(
  "/:id",
  verifyToken,
  isAdminOrStaff,
  upload.single("logo"),
  brandController.update,
);
router.delete("/:id", verifyToken, isAdminOrStaff, brandController.delete);

module.exports = router;
