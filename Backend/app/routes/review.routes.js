const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { verifyToken, isAdminOrStaff } = require("../middlewares/auth.middleware");

// CÔNG KHAI: Ai cũng xem được đánh giá của sản phẩm
router.get("/product/:productId", reviewController.findByProduct);

// USER: Phải đăng nhập mới được viết đánh giá
router.post("/", verifyToken, reviewController.create);

// ADMIN/STAFF: Xem tất cả và xóa đánh giá vi phạm
router.get("/", verifyToken, isAdminOrStaff, reviewController.findAll);
router.delete("/:id", verifyToken, isAdminOrStaff, reviewController.delete);

module.exports = router;