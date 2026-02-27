const SportModel = require("../models/sport.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const SportController = {
  create: asyncHandler(async (req, res) => {
    const id = await SportModel.create(req.body);
    res.status(201).json({ message: "Tạo môn thể thao thành công", id });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await SportModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const sport = await SportModel.getById(req.params.id);
    if (!sport) {
      throw new ApiError(404, "Không tìm thấy môn thể thao");
    }
    res.json(sport);
  }),

  update: asyncHandler(async (req, res) => {
    const sportId = req.params.id;
    const data = req.body;
    const existingSport = await SportModel.getById(sportId);
    if (!existingSport) {
      throw new ApiError(404, "Không tìm thấy môn thể thao để cập nhật");
    }
    if (!data.name) {
      data.name = existingSport.name;
    }
    await SportModel.update(sportId, data);
    res.json({ message: "Cập nhật môn thể thao thành công" });
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await SportModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy môn thể thao để xóa");
    }
    res.json({ message: "Xóa môn thể thao thành công" });
  }),
};

module.exports = SportController;
