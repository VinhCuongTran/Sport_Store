const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const AuthMiddleware = {
  // 1. Kiểm tra xem User đã đăng nhập chưa
  verifyToken: asyncHandler(async (req, res, next) => {
    // Lấy token từ header 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "Bạn chưa đăng nhập hoặc không có quyền truy cập",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // Giải mã token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Gắn thông tin user (id, role) từ token vào request để các Controller dùng
      req.user = decoded;
      next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(
          401,
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        );
      }
      throw new ApiError(401, "Token không hợp lệ");
    }
  }),

  // 2. Kiểm tra xem User có phải là Admin hoặc Staff không
  isAdminOrStaff: asyncHandler(async (req, res, next) => {
    // Phải đặt middleware này SAU middleware verifyToken
    if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
      next(); // Là admin hoặc staff -> Cho phép đi tiếp
    } else {
      throw new ApiError(403, "Bạn không có quyền thực hiện hành động này");
    }
  }),

  // 3. Chỉ dành cho Admin tối cao
  isAdminOnly: asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      throw new ApiError(
        403,
        "Chỉ Quản trị viên (Admin) mới có quyền thực hiện hành động này",
      );
    }
  }),
};

module.exports = AuthMiddleware;
