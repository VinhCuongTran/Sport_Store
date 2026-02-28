const CartModel = require("../models/cart.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const CartController = {
  // Lấy giỏ hàng của user
  getCart: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    if (!userId) throw new ApiError(400, "Thiếu userId");

    const cartId = await CartModel.getCartIdByUserId(userId);
    const items = await CartModel.getCartItems(cartId);

    res.json({ cart_id: cartId, items });
  }),

  // Thêm sản phẩm vào giỏ
  addToCart: asyncHandler(async (req, res) => {
    const { user_id, product_id, variant_id, quantity } = req.body;

    if (!user_id || !product_id || !variant_id || !quantity) {
      throw new ApiError(
        400,
        "Vui lòng cung cấp đủ user_id, product_id, variant_id và quantity",
      );
    }

    if (quantity <= 0) throw new ApiError(400, "Số lượng phải lớn hơn 0");

    const cartId = await CartModel.getCartIdByUserId(user_id);
    const cartItemId = await CartModel.addItem(
      cartId,
      product_id,
      variant_id,
      quantity,
    );

    res
      .status(201)
      .json({
        message: "Thêm vào giỏ hàng thành công",
        cart_item_id: cartItemId,
      });
  }),

  // Cập nhật số lượng
  updateQuantity: asyncHandler(async (req, res) => {
    const cartItemId = req.params.itemId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new ApiError(400, "Số lượng không hợp lệ");
    }

    const isUpdated = await CartModel.updateItemQuantity(cartItemId, quantity);
    if (!isUpdated)
      throw new ApiError(404, "Không tìm thấy sản phẩm trong giỏ hàng");

    res.json({ message: "Cập nhật số lượng thành công" });
  }),

  // Xóa sản phẩm khỏi giỏ
  removeItem: asyncHandler(async (req, res) => {
    const cartItemId = req.params.itemId;

    const isDeleted = await CartModel.removeItem(cartItemId);
    if (!isDeleted) throw new ApiError(404, "Không tìm thấy sản phẩm để xóa");

    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  }),

  // Xóa toàn bộ sản phẩm trong giỏ hàng
  clearCart: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const cartId = await CartModel.getCartIdByUserId(userId);

    await CartModel.clearCart(cartId);
    res.json({ message: "Đã làm sạch giỏ hàng" });
  }),
};

module.exports = CartController;
