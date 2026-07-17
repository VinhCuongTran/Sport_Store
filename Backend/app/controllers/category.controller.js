const CategoryModel = require("../models/category.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const ActivityLog = require("../models/activity_log.model");

const CategoryController = {
  create: asyncHandler(async (req, res) => {
    const id = await CategoryModel.create(req.body);
    await ActivityLog.logAction(req.user.id, 'CREATE_CATEGORY', `Đã tạo danh mục mới`, id);
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
    await ActivityLog.logAction(req.user.id, 'UPDATE_CATEGORY', `Đã cập nhật danh mục`, req.params.id);
    res.json({ message: "Cập nhật danh mục thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await CategoryModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy danh mục để xóa");
    }
    await ActivityLog.logAction(req.user.id, 'DELETE_CATEGORY', `Đã xóa danh mục`, req.params.id);
    res.json({ message: "Xóa danh mục thành công" });
  }),
};

module.exports = CategoryController;
