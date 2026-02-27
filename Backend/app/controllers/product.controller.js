const ProductModel = require("../models/product.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const Product = {
  create: asyncHandler(async (req, res) => {
    const productData = req.body;
    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (error) {
        throw new ApiError(
          400,
          "Định dạng variants không hợp lệ, phải là mảng JSON hợp lệ",
        );
      }
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        image_url: file.path,
        // Tự động gán ảnh đầu tiên làm ảnh đại diện
        is_thumbnail: index === 0 ? true : false,
      }));
    }
    const productId = await ProductModel.create(productData, variants, images);
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId,
      images_uploaded: images,
    });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await ProductModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const data = await ProductModel.getById(req.params.id);
    if (!data) {
      throw new ApiError(404, "Không tìm thấy sản phẩm");
    }
    res.json(data);
  }),

  update: asyncHandler(async (req, res) => {
    const { variants, images, ...productData } = req.body;
    const success = await ProductModel.update(
      req.params.id,
      productData,
      variants,
    );
    if (!success) {
      throw new ApiError(404, "Cập nhật thất bại hoặc không tìm thấy sản phẩm");
    }
    res.json({ message: "Cập nhật thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const success = await ProductModel.delete(req.params.id);
    if (!success) {
      throw new ApiError(404, "Không tìm thấy sản phẩm để xóa");
    }
    res.json({ message: "Đã xóa sản phẩm thành công" });
  }),
};

module.exports = Product;
