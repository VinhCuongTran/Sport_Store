const ReviewModel = require("../models/review.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const ActivityLog = require("../models/activity_log.model");
const axios = require("axios");

const ReviewController = {
  create: asyncHandler(async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
      throw new ApiError(
        400,
        "Vui lòng cung cấp ID sản phẩm và số sao đánh giá",
      );
    }

    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Số sao đánh giá phải từ 1 đến 5");
    }

    const hasReviewed = await ReviewModel.checkUserReviewed(
      product_id,
      user_id,
    );
    if (hasReviewed) {
      throw new ApiError(400, "Bạn đã đánh giá sản phẩm này rồi!");
    }

    let reviewStatus = "approved";
    let responseMessage = "Cảm ơn bạn đã đánh giá sản phẩm!";

    // MÔ HÌNH MÁY HỌC PHÂN LOẠI
    if (comment && comment.trim() !== "") {
      try {
        const aiResponse = await axios.post("http://localhost:8080/predict", {
          text: comment,
        });

        if (aiResponse.data.prediction === "violation") {
          reviewStatus = "pending";
          responseMessage =
            "Đánh giá của bạn chứa từ ngữ nhạy cảm và đang được chờ Admin kiểm duyệt.";
        }
      } catch (aiError) {
        console.error(
          "Lỗi khi kết nối với AI Model, tự động pass:",
          aiError.message,
        );
      }
    }

    const id = await ReviewModel.create({
      product_id,
      user_id,
      rating,
      comment,
      status: reviewStatus,
    });

    res.status(201).json({ message: responseMessage, id });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await ReviewModel.getAll();
    res.json(data);
  }),

  findByProduct: asyncHandler(async (req, res) => {
    const data = await ReviewModel.getByProductId(req.params.productId);
    res.json(data);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const isUpdated = await ReviewModel.updateStatus(id, status);
    if (!isUpdated) throw new ApiError(404, "Không tìm thấy đánh giá");

    await ActivityLog.logAction(
      req.user.id,
      "UPDATE_REVIEW",
      `Đã đổi trạng thái đánh giá thành ${status}`,
      id,
    );
    res.json({ message: "Cập nhật trạng thái thành công" });
  }),

  reportReview: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isUpdated = await ReviewModel.updateStatus(id, "reported");
    if (!isUpdated) throw new ApiError(404, "Không tìm thấy đánh giá");

    res.json({
      message: "Báo cáo thành công. Admin sẽ kiểm tra lại đánh giá này.",
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await ReviewModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy đánh giá để xóa");
    }

    await ActivityLog.logAction(
      req.user.id,
      "DELETE_REVIEW",
      `Đã xóa đánh giá`,
      req.params.id,
    );
    res.json({ message: "Xóa đánh giá thành công" });
  }),
};

module.exports = ReviewController;
