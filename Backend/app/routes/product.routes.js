const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");
router.get("/", productController.findAll);
router.get("/:id", productController.findOne);
router.post(
  "/",
  verifyToken,
  isAdminOrStaff,
  upload.array("images", 20),
  productController.create,
);
router.put(
  "/:id",
  verifyToken,
  isAdminOrStaff,
  upload.array("images", 20),
  productController.update,
);

router.delete("/:id", verifyToken, isAdminOrStaff, productController.delete);

module.exports = router;
