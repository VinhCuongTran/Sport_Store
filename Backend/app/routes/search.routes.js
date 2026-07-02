const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");
const memoryUpload = require("../middlewares/memoryUpload.middleware");

// Route nhận ảnh (Không cần đăng nhập vẫn tìm được)
router.post("/image", memoryUpload.single("image"), searchController.searchByImage);

module.exports = router;