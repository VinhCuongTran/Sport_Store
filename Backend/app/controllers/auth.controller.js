const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const config = require("../config");

const DEFAULT_AVATAR_MALE =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772181216/Male_gqcp4c.jpg";
const DEFAULT_AVATAR_FEMALE =
  "https://res.cloudinary.com/dosb4fmpo/image/upload/v1772182096/Female_exbvnm.jpg";

const AuthController = {
  register: asyncHandler(async (req, res) => {
    const data = req.body;

    if (data.gender === "male") {
      data.avatar = DEFAULT_AVATAR_MALE;
    } else if (data.gender === "female") {
      data.avatar = DEFAULT_AVATAR_FEMALE;
    }

    if (!data.name || !data.email || !data.password) {
      throw new ApiError(400, "Vui lòng cung cấp đủ name, email và password");
    }

    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    try {
      const id = await UserModel.create(data);
      res.status(201).json({
        message: "Đăng ký tài khoản thành công",
        id,
        gender: data.gender,
        avatar: data.avatar,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ApiError(400, "Email hoặc Số điện thoại này đã được sử dụng");
      }
      throw error;
    }
  }),

  login: asyncHandler(async (req, res) => {
    const identifier =
      req.body.identifier || req.body.email || req.body.phone_number;
    const password = req.body.password;

    if (!identifier || !password) {
      throw new ApiError(400, "Vui lòng nhập Email/Số điện thoại và Mật khẩu");
    }

    const user = await UserModel.findByIdentifier(identifier);
    if (!user) {
      throw new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác");
    }

    if (user.status === "blocked") {
      throw new ApiError(
        403,
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.",
      );
    }

    const payload = { id: user.id, role: user.role };

    // 1. Tạo Access Token (Ngắn hạn: ví dụ 1 giờ)
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn, // Thay đổi tùy config của bạn
    });

    // 2. Tạo Refresh Token (Dài hạn: ví dụ 7 ngày)
    // Lưu ý: Tốt nhất nên cấu hình một chuỗi secret khác cho refresh token
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    // TÙY CHỌN: Bạn nên lưu refreshToken này vào Database (bảng users) để quản lý (cho phép thu hồi khi cần)
    // await UserModel.update(user.id, { refresh_token: refreshToken });

    delete user.password;

    res.json({
      message: "Đăng nhập thành công",
      accessToken: accessToken,
      refreshToken: refreshToken, // Trả thêm cái này về
      user: user,
    });
  }),

  // Thêm hàm mới: API để cấp lại Access Token
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(403, "Không tìm thấy Refresh Token");
    }

    try {
      // 1. SỬA CHỖ NÀY: Dùng config.jwt.refreshSecret để xác minh
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      const payload = { id: decoded.id, role: decoded.role };

      // 2. SỬA CHỖ NÀY: Lấy thời gian sống từ file config thay vì gõ cứng "1h"
      const newAccessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      throw new ApiError(
        403,
        "Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }
  }),

  logout: asyncHandler(async (req, res) => {
    res.json({
      message: "Đăng xuất thành công. Vui lòng xóa Token ở phía Client.",
    });
  }),
};

module.exports = AuthController;
