const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");

router.get("/", userController.findAll);
router.get("/:id", userController.findOne);
router.put("/:id", upload.single("avatar"), userController.update);
router.delete("/:id", userController.delete);

module.exports = router;
