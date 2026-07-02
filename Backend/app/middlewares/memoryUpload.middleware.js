const multer = require("multer");
const ApiError = require("../utils/api.error");

const storage = multer.memoryStorage(); // Lưu vào Buffer (RAM), không lưu ổ cứng

const memoryUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Chỉ cho phép tải lên định dạng hình ảnh!"), false);
    }
  },
});

module.exports = memoryUpload;