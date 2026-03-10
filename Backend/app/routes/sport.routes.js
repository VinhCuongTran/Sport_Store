const express = require("express");
const router = express.Router();
const sportController = require("../controllers/sport.controller");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/", sportController.findAll);
router.get("/:id", sportController.findOne);
router.post("/", verifyToken, isAdminOrStaff, sportController.create);
router.put("/:id", verifyToken, isAdminOrStaff, sportController.update);
router.delete("/:id", verifyToken, isAdminOrStaff, sportController.delete);

module.exports = router;
