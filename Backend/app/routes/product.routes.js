const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload.middleware");
const {
  verifyToken,
  isAdminOrStaff,
} = require("../middlewares/auth.middleware");

// ==========================================
// ĐẶT CÁC ROUTE CỐ ĐỊNH (STATIC) LÊN TRÊN CÙNG
// ==========================================
router.get(
  "/all-variants",
  verifyToken,
  isAdminOrStaff,
  productController.getAllVariants,
);
router.get(
  "/stock-tickets",
  verifyToken,
  isAdminOrStaff,
  productController.getAllStockTickets,
);

router.post(
  "/stock-tickets",
  verifyToken,
  isAdminOrStaff,
  productController.createStockTicket,
);

router.get(
  "/stock-tickets/:id",
  verifyToken,
  isAdminOrStaff,
  productController.getStockTicketById,
);

// ==========================================
// CÁC ROUTE ĐỘNG VÀ CŨ CỦA BẠN BÊN DƯỚI[cite: 12]
// ==========================================
router.get("/", productController.findAll);

// Bất kỳ cái gì có dạng tham số (/:id) phải nằm dưới cùng
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

// Route Nhập hàng cho biến thể
router.post(
  "/variants/:id/import",
  verifyToken,
  isAdminOrStaff,
  productController.importStock,
);

router.post(
  "/favorite/toggle",
  verifyToken,
  productController.toggleFavorite,
);

router.get(
  "/favorite/list",
  verifyToken,
  productController.getFavoriteProducts,
);

module.exports = router;
