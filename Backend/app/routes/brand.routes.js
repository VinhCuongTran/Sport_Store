const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/", upload.single("logo"), brandController.create);
router.get("/", brandController.findAll);
router.get("/:id", brandController.findOne);
router.put("/:id", upload.single("logo"), brandController.update);
router.delete("/:id", brandController.delete);

module.exports = router;
