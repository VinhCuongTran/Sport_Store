const NotificationModel = require("../models/notification.model");
const ApiError = require("../utils/api.error");

exports.getAll = async (req, res, next) => {
  try {
    // Giả sử middleware auth đã gắn req.user.id
    const userId = req.user.id;
    const notifications = await NotificationModel.getByUserId(userId);
    return res.send(notifications);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông báo"));
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await NotificationModel.markAsRead(req.params.id, req.user.id);
    return res.send({ message: "Đã đánh dấu đọc" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái"));
  }
};
