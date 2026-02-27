const BrandModel = require("../models/brand.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const BrandController = {
  create: asyncHandler(async (req, res) => {
    const data = req.body;
    if (req.file) data.logo_url = req.file.path;
    const id = await BrandModel.create(data);
    res.status(201).json({
      message: "Tạo thương hiệu thành công",
      id,
      logo_url: data.logo_url,
    });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await BrandModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const brand = await BrandModel.getById(req.params.id);
    if (!brand) {
      throw new ApiError(404, "Không tìm thấy thương hiệu");
    }
    res.json(brand);
  }),

  update: asyncHandler(async (req, res) => {
    const data = req.body;
    if (req.file) {
      data.logo_url = req.file.path;
    } else if (!data.logo_url) {
      const existingBrand = await BrandModel.getById(req.params.id);
      if (existingBrand) data.logo_url = existingBrand.logo_url;
    }
    const isUpdated = await BrandModel.update(req.params.id, data);
    if (!isUpdated) {
      throw new ApiError(404, "Không tìm thấy thương hiệu để cập nhật");
    }
    res.json({ message: "Cập nhật thương hiệu thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await BrandModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy thương hiệu để xóa");
    }
    res.json({ message: "Xóa thương hiệu thành công" });
  }),
};

module.exports = BrandController;
