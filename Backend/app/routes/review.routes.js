const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/product/:productId", reviewController.findByProduct);
router.post("/", verifyToken, reviewController.create);

// KHÁCH HÀNG BÁO CÁO VI PHẠM
router.post("/:id/report", verifyToken, reviewController.reportReview);

// ADMIN QUẢN LÝ
router.get("/", verifyToken, isAdminOrStaff, reviewController.findAll);
router.patch(
  "/:id/status",
  verifyToken,
  isAdminOrStaff,
  reviewController.updateStatus,
);
router.delete("/:id", verifyToken, isAdminOrStaff, reviewController.delete);

module.exports = router;
