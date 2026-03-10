const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, addressController.getAllByUser);
router.post("/", verifyToken, addressController.create);
router.put("/:id", verifyToken, addressController.update);
router.delete("/:id", verifyToken, addressController.delete);
router.put("/:id/default", verifyToken, addressController.setDefault);

module.exports = router;
