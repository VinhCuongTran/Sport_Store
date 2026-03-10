const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");
router.get("/", brandController.findAll);
router.get("/:id", brandController.findOne);
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
