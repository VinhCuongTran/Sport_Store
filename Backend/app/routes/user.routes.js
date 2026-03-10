const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

router.get("/", verifyToken, isAdminOrStaff, userController.findAll);
router.get("/:id", verifyToken, userController.findOne);
router.put("/:id", verifyToken, upload.single("avatar"), userController.update);
router.delete("/:id", verifyToken, isAdminOrStaff, userController.delete);

module.exports = router;
