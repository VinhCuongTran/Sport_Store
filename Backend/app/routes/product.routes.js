const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload.middleware");

// Import thêm AuthMiddleware
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

// Các API ai cũng xem được
router.get("/", productController.findAll);
router.get("/:id", productController.findOne);

// Các API cần quyền Admin/Staff
router.post(
  "/",
  verifyToken,
  isAdminOrStaff,
  upload.array("images", 5),
  productController.create,
);

router.put("/:id", verifyToken, isAdminOrStaff, productController.update);

router.delete("/:id", verifyToken, isAdminOrStaff, productController.delete);

module.exports = router;
