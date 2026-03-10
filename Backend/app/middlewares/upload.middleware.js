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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderPath = "sport_store/general";

    try {
      if (req.originalUrl.includes("/api/brands")) {
        folderPath = "sport_store/brands";
        if (req.body.name) {
          const safeBrandName = req.body.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");

          return {
            folder: folderPath,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${safeBrandName}_Logo`,
          };
        }
      } else if (req.originalUrl.includes("/api/users")) {
        folderPath = "sport_store/users";
        const match = req.originalUrl.match(/\/api\/users\/(\d+)/);
        if (match) {
          const userId = match[1];
          return {
            folder: folderPath,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `avatar_${userId}`,
          };
        }
      } else if (req.originalUrl.includes("/api/products")) {
        let categoryId = req.body.category_id;
        const match = req.originalUrl.match(/\/api\/products\/(\d+)/);
        if (match && !categoryId) {
          const product = await ProductModel.getById(match[1]);
          if (product) categoryId = product.category_id;
        }

        if (categoryId) {
          const leafCategory = await CategoryModel.getById(categoryId);

          if (leafCategory) {
            let parentName = "Khac";
            let leafName = leafCategory.name;
            if (leafCategory.parent_id) {
              const parentCategory = await CategoryModel.getById(
                leafCategory.parent_id,
              );
              if (parentCategory) {
                parentName = parentCategory.name;
              }
            }

            folderPath = `sport_store/products/${parentName}/${leafName}`;
          } else {
            folderPath = "sport_store/products/Chua_phan_loai";
          }
        } else {
          folderPath = "sport_store/products/Chua_phan_loai";
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo folder Cloudinary:", error);
      folderPath = "sport_store/error_uploads";
    }

    return {
      folder: folderPath,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
