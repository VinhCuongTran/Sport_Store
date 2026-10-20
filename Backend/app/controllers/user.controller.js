const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const ActivityLog = require("../models/activity_log.model");

const UserController = {
  findAll: asyncHandler(async (req, res) => {
    const data = await UserModel.getAll();
    res.json(data);
  }),

  findOne: asyncHandler(async (req, res) => {
    const user = await UserModel.getById(req.params.id);
    if (!user) throw new ApiError(404, "Không tìm thấy người dùng");
    res.json(user);
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await UserModel.delete(req.params.id);
    if (!isDeleted) throw new ApiError(404, "Không tìm thấy người dùng để xóa");
    await ActivityLog.logAction(req.user.id, 'DELETE_USER', `Đã xóa người dùng`, req.params.id);
    res.json({ message: "Xóa người dùng thành công" });
  }),

update: asyncHandler(async (req, res) => {
    const data = req.body;

    // Lấy targetId từ params nếu có, hoặc mặc định là chính user đang đăng nhập
    const targetId = req.params.id || req.user.id;

    // Kiểm tra quyề
    // Nếu KHÔNG phải admin/staff VÀ đang cố tìnhn hạn:  sửa tài khoản của NGƯỜI KHÁC thì mới chặn lại
    if (req.user && req.user.role !== "admin" && req.user.role !== "staff") {
      delete data.role; 
      delete data.status;

      // So sánh ID chuỗi để cho phép customer tự sửa thông tin/avatar của chính họ
      if (String(req.user.id) !== String(targetId)) {
        throw new ApiError(
          403,
          "Bạn không có quyền cập nhật tài khoản người khác",
        );
      }
    }

    if (req.file) {
      data.avatar = req.file.path;
    }

    if (data.phone_number === "") data.phone_number = null;

    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }

    try {
      const isUpdated = await UserModel.update(targetId, data);
      if (!isUpdated) {
        throw new ApiError(404, "Không tìm thấy người dùng để cập nhật");
      }
      res.json({
        message: "Cập nhật người dùng thành công",
        avatar: data.avatar || "Giữ nguyên ảnh cũ",
      });
      await ActivityLog.logAction(req.user.id, 'UPDATE_USER', `Đã cập nhật người dùng`, targetId);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ApiError(
          400,
          "Email hoặc Số điện thoại này đã được sử dụng bởi người khác",
        );
      }
      throw error;
    }
  }),
};

module.exports = UserController;
