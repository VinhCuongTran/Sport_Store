const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const AuthMiddleware = {
  verifyToken: asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "Bạn chưa đăng nhập hoặc không có quyền truy cập",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      next();
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

  isAdminOrStaff: asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
      next();
    } else {
      throw new ApiError(403, "Bạn không có quyền thực hiện hành động này");
    }
  }),

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
