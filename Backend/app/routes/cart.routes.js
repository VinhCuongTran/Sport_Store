const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/:userId", verifyToken, cartController.getCart);
router.post("/add", verifyToken, cartController.addToCart);
router.put("/item/:itemId", verifyToken, cartController.updateQuantity);
router.delete("/item/:itemId", verifyToken, cartController.removeItem);
router.delete("/clear/:userId", verifyToken, cartController.clearCart);

module.exports = router;
