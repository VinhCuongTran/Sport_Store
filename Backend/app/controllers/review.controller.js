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

    let reviewStatus = "pending";
    let responseMessage =
      "Đánh giá của bạn đã được ghi nhận và đang chờ duyệt.";
    let aiLabel = null;
    let aiConfidence = null;
    let aiProbs = null; // Biến lưu phân bổ xác suất

    if (comment && comment.trim() !== "") {
      try {
        const aiResponse = await axios.post("http://localhost:8080/predict", {
          text: comment,
        });

        aiLabel = aiResponse.data.prediction;
        aiConfidence = aiResponse.data.probability;

        // Trích xuất và chuyển đổi object probabilities thành chuỗi JSON
        if (aiResponse.data.probabilities) {
          aiProbs = JSON.stringify(aiResponse.data.probabilities);
        }

        if (aiLabel === "valid" && aiConfidence >= 0.8) {
          reviewStatus = "approved";
          responseMessage = "Cảm ơn bạn đã đánh giá sản phẩm!";
        } else if (aiLabel === "violation" && aiConfidence >= 0.9) {
          reviewStatus = "rejected";
          responseMessage =
            "Đánh giá của bạn vi phạm tiêu chuẩn cộng đồng và đã bị từ chối.";
        } else {
          reviewStatus = "pending";
          responseMessage =
            "Đánh giá của bạn chứa nội dung cần xác minh, đang chờ Admin kiểm duyệt.";
        }
      } catch (aiError) {
        console.error("Lỗi khi kết nối với AI Model:", aiError.message);
        reviewStatus = "pending";
        responseMessage = "Đánh giá của bạn đang được hệ thống xử lý.";
      }
    } else {
      reviewStatus = "approved";
      responseMessage = "Cảm ơn bạn đã đánh giá sản phẩm!";
    }

    // Truyền thêm ai_probs vào Model
    const id = await ReviewModel.create({
      product_id,
      user_id,
      rating,
      comment,
      status: reviewStatus,
      ai_label: aiLabel,
      ai_confidence: aiConfidence,
      ai_probs: aiProbs,
    });

    res
      .status(201)
      .json({ message: responseMessage, id, status: reviewStatus });
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
      "UPDATE_REVIEW_STATUS",
      `Admin đã đổi trạng thái đánh giá thành ${status} (Duyệt thủ công)`,
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
