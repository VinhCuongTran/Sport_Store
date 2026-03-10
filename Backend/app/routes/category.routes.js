const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");
router.get("/", categoryController.findAll);
router.get("/:id", categoryController.findOne);
router.post("/", verifyToken, isAdminOrStaff, categoryController.create);
router.put("/:id", verifyToken, isAdminOrStaff, categoryController.update);
router.delete("/:id", verifyToken, isAdminOrStaff, categoryController.delete);

module.exports = router;
