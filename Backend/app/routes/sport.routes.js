const express = require("express");
const router = express.Router();
const sportController = require("../controllers/sport.controller");

router.post("/", sportController.create);
router.get("/", sportController.findAll);
router.get("/:id", sportController.findOne);
router.put("/:id", sportController.update);
router.delete("/:id", sportController.delete);

module.exports = router;
