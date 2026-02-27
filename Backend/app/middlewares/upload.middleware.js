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
      // 1. Xử lý cho Brand
      if (req.originalUrl.includes("/api/brands")) {
        folderPath = "sport_store/brands";
      }
      // 2. Xử lý cho Product (Tạo thư mục dựa theo Category)
      else if (req.originalUrl.includes("/api/products")) {
        let categoryId = req.body.category_id;

        // Nếu là API Update (có ID trên URL) mà người dùng không gửi category_id mới, ta lấy category_id cũ từ DB
        const match = req.originalUrl.match(/\/api\/products\/(\d+)/);
        if (match && !categoryId) {
          const product = await ProductModel.getById(match[1]);
          if (product) categoryId = product.category_id;
        }

        if (categoryId) {
          // Lấy thông tin danh mục hiện tại
          const leafCategory = await CategoryModel.getById(categoryId);
          
          if (leafCategory) {
            let parentName = "Khac"; // Mặc định nếu không có cha
            let leafName = leafCategory.name;

            // Nếu danh mục này có cha (có parent_id), đi tìm tên danh mục cha
            if (leafCategory.parent_id) {
              const parentCategory = await CategoryModel.getById(leafCategory.parent_id);
              if (parentCategory) {
                parentName = parentCategory.name;
              }
            }

            // Gộp lại thành đường dẫn chuẩn: sport_store/products/parentName/leafName
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
      folderPath = "sport_store/error_uploads"; // Đường dẫn dự phòng nếu DB bị lỗi
    }

    return {
      folder: folderPath,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;