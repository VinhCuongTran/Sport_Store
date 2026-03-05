const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

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
    res.json({ message: "Xóa người dùng thành công" });
  }),

  update: asyncHandler(async (req, res) => {
    const data = req.body;

    // BỔ SUNG: Ràng buộc bảo mật (giả sử req.user được gán từ verifyToken)
    // Nếu không phải admin, không cho phép đổi quyền (role) và trạng thái (status)
    if (req.user && req.user.role !== "admin" && req.user.role !== "staff") {
      delete data.role;
      delete data.status;

      // Ngăn chặn việc sửa tài khoản người khác nếu không phải admin
      if (req.user.id !== parseInt(req.params.id)) {
        throw new ApiError(
          403,
          "Bạn không có quyền cập nhật tài khoản người khác",
        );
      }
    }

    if (req.file) {
      data.avatar = req.file.path;
    }

    // Xử lý khi user gửi chuỗi rỗng lên để xóa số điện thoại
    if (data.phone_number === "") data.phone_number = null;

    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }

    try {
      const isUpdated = await UserModel.update(req.params.id, data);
      if (!isUpdated) {
        throw new ApiError(404, "Không tìm thấy người dùng để cập nhật");
      }
      res.json({
        message: "Cập nhật người dùng thành công",
        avatar: data.avatar || "Giữ nguyên ảnh cũ",
      });
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
