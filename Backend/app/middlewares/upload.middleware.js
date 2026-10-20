const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const config = require("../config");

const CategoryModel = require("../models/category.model");
const ProductModel = require("../models/product.model");

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Hàm tạo mã ngẫu nhiên 6 ký tự
const makeShortId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderPath = "sport_store/general";
    let publicId = null;

    try {
      if (req.originalUrl.includes("/api/brands")) {
        folderPath = "sport_store/brands";
        if (req.body.name) {
          return {
            folder: folderPath,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${req.body.name}_Logo_${makeShortId()}`,
          };
        }
      } else if (req.originalUrl.includes("/api/users")) {
        folderPath = "sport_store/users";
        const match = req.originalUrl.match(/\/api\/users\/([^\/]+)/);
        if (match) {
          return {
            folder: folderPath,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            // Avatar ghi đè trực tiếp vì user chỉ có 1 ảnh đại diện
            public_id: `avatar_${match[1]}`,
          };
        }
      } else if (req.originalUrl.includes("/api/products")) {
        let categoryId = req.body.category_id;
        let productName = req.body.name;

        const match = req.originalUrl.match(/\/api\/products\/([^\/]+)/);
        if (match) {
          const product = await ProductModel.getById(match[1]);
          if (product) {
            if (!categoryId) categoryId = product.category_id;
            if (!productName) productName = product.name;
          }
        }

        // 1. Nhóm toàn bộ ảnh vào folder riêng mang tên sản phẩm (Giữ tiếng Việt)
        if (categoryId) {
          let currentCategoryId = categoryId;
          const pathParts = [];
          let depth = 0;

          while (currentCategoryId && depth < 10) {
            const category = await CategoryModel.getById(currentCategoryId);
            if (!category) break;

            pathParts.unshift(category.name);
            currentCategoryId = category.parent_id;
            depth++;
          }

          const finalProductName = productName || "Chua_co_ten";
          pathParts.push(finalProductName);

          folderPath = `sport_store/products/${pathParts.join("/")}`;
        } else {
          folderPath = `sport_store/products/Chua_phan_loai/${productName || "Chua_co_ten"}`;
        }

        // 2. Cấp phát ID ngẫu nhiên cho từng ảnh để tránh kẹt Cache CDN và xóa nhầm
        publicId = `img_${makeShortId()}`;

        return {
          folder: folderPath,
          allowed_formats: ["jpg", "png", "jpeg", "webp","avif"],
          public_id: publicId,
        };
      }
    } catch (error) {
      console.error("Lỗi khi tạo folder Cloudinary:", error);
      folderPath = "sport_store/error_uploads";
    }

    return {
      folder: folderPath,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      ...(publicId && { public_id: publicId }),
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
