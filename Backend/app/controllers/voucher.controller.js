const VoucherModel = require("../models/voucher.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const VoucherController = {
  create: asyncHandler(async (req, res) => {
    try {
      const id = await VoucherModel.create(req.body);
      res.status(201).json({ message: "Tạo voucher thành công", id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ApiError(400, "Mã voucher này đã tồn tại!");
      }
      throw error;
    }
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await VoucherModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const voucher = await VoucherModel.getById(req.params.id);
    if (!voucher) throw new ApiError(404, "Không tìm thấy voucher");
    res.json(voucher);
  }),

  update: asyncHandler(async (req, res) => {
    try {
      const isUpdated = await VoucherModel.update(req.params.id, req.body);
      if (!isUpdated)
        throw new ApiError(404, "Không tìm thấy voucher để cập nhật");
      res.json({ message: "Cập nhật voucher thành công" });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ApiError(400, "Mã voucher này đã tồn tại!");
      }
      throw error;
    }
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await VoucherModel.delete(req.params.id);
    if (!isDeleted) throw new ApiError(404, "Không tìm thấy voucher để xóa");
    res.json({ message: "Xóa voucher thành công" });
  }),
};

module.exports = VoucherController;
