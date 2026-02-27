const CategoryModel = require("../models/category.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const CategoryController = {
  create: asyncHandler(async (req, res) => {
    const id = await CategoryModel.create(req.body);
    res.status(201).json({ message: "Tạo danh mục thành công", id });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await CategoryModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const category = await CategoryModel.getById(req.params.id);
    if (!category) {
      throw new ApiError(404, "Không tìm thấy danh mục");
    }
    res.json(category);
  }),

  update: asyncHandler(async (req, res) => {
    const isUpdated = await CategoryModel.update(req.params.id, req.body);
    if (!isUpdated) {
      throw new ApiError(404, "Không tìm thấy danh mục để cập nhật");
    }
    res.json({ message: "Cập nhật danh mục thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await CategoryModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy danh mục để xóa");
    }
    res.json({ message: "Xóa danh mục thành công" });
  }),
};

module.exports = CategoryController;
