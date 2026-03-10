const ReviewModel = require("../models/review.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

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

    const id = await ReviewModel.create({
      product_id,
      user_id,
      rating,
      comment,
    });
    res.status(201).json({ message: "Cảm ơn bạn đã đánh giá sản phẩm!", id });
  }),

  findAll: asyncHandler(async (req, res) => {
    const data = await ReviewModel.getAll();
    res.json(data);
  }),

  findByProduct: asyncHandler(async (req, res) => {
    const data = await ReviewModel.getByProductId(req.params.productId);
    res.json(data);
  }),

  delete: asyncHandler(async (req, res) => {
    const isDeleted = await ReviewModel.delete(req.params.id);
    if (!isDeleted) {
      throw new ApiError(404, "Không tìm thấy đánh giá để xóa");
    }
    res.json({ message: "Xóa đánh giá thành công" });
  }),
};

module.exports = ReviewController;
