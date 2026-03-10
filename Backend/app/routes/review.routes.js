const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/product/:productId", reviewController.findByProduct);
router.post("/", verifyToken, reviewController.create);
router.get("/", verifyToken, isAdminOrStaff, reviewController.findAll);
router.delete("/:id", verifyToken, isAdminOrStaff, reviewController.delete);

module.exports = router;
