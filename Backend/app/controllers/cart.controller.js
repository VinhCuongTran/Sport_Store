const CartModel = require("../models/cart.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const db = require("../utils/mysql.db");

const CartController = {
  getCart: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    if (!userId) throw new ApiError(400, "Thiếu userId");

    const cartId = await CartModel.getCartIdByUserId(userId);
    let items = await CartModel.getCartItems(cartId);
    let isModified = false;
    for (let item of items) {
      if (item.stock === 0) {
        await CartModel.removeItem(item.cart_item_id);
        isModified = true;
      } else if (item.quantity > item.stock) {
        await CartModel.updateItemQuantity(item.cart_item_id, item.stock);
        isModified = true;
      }
    }
    if (isModified) {
      items = await CartModel.getCartItems(cartId);
    }
    res.json({ cart_id: cartId, items });
  }),

  addToCart: asyncHandler(async (req, res) => {
    const { user_id, product_id, variant_id, quantity } = req.body;

    if (!user_id || !product_id || !variant_id || !quantity) {
      throw new ApiError(400, "Vui lòng cung cấp đủ thông tin");
    }

    if (quantity <= 0) throw new ApiError(400, "Số lượng phải lớn hơn 0");

    const [variantData] = await db.query(
      "SELECT stock FROM product_variants WHERE id = ?",
      [variant_id],
    );

    if (variantData.length === 0)
      throw new ApiError(404, "Không tìm thấy phân loại sản phẩm");

    const stock = variantData[0].stock;
    if (stock === 0) throw new ApiError(400, "Sản phẩm này đã hết hàng");

    const cartId = await CartModel.getCartIdByUserId(user_id);
    const [existingItem] = await db.query(
      "SELECT quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?",
      [cartId, variant_id],
    );
    const currentQuantityInCart =
      existingItem.length > 0 ? existingItem[0].quantity : 0;
    if (currentQuantityInCart + quantity > stock) {
      throw new ApiError(
        400,
        `Vượt giới hạn kho! Bạn đang có ${currentQuantityInCart} SP trong giỏ, kho chỉ còn ${stock}.`,
      );
    }

    const cartItemId = await CartModel.addItem(
      cartId,
      product_id,
      variant_id,
      quantity,
    );

    res.status(201).json({
      message: "Thêm vào giỏ hàng thành công",
      cart_item_id: cartItemId,
    });
  }),

  updateQuantity: asyncHandler(async (req, res) => {
    const cartItemId = req.params.itemId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new ApiError(400, "Số lượng không hợp lệ");
    }

    const [cartItemData] = await db.query(
      "SELECT pv.stock FROM cart_items ci JOIN product_variants pv ON ci.variant_id = pv.id WHERE ci.id = ?",
      [cartItemId],
    );

    if (cartItemData.length === 0)
      throw new ApiError(404, "Không tìm thấy sản phẩm trong giỏ hàng");
    if (quantity > cartItemData[0].stock) {
      throw new ApiError(
        400,
        `Số lượng yêu cầu vượt quá tồn kho (Kho chỉ còn ${cartItemData[0].stock}).`,
      );
    }

    const isUpdated = await CartModel.updateItemQuantity(cartItemId, quantity);
    res.json({ message: "Cập nhật số lượng thành công" });
  }),

  removeItem: asyncHandler(async (req, res) => {
    const cartItemId = req.params.itemId;

    const isDeleted = await CartModel.removeItem(cartItemId);
    if (!isDeleted) throw new ApiError(404, "Không tìm thấy sản phẩm để xóa");

    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  }),

  clearCart: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const cartId = await CartModel.getCartIdByUserId(userId);

    await CartModel.clearCart(cartId);
    res.json({ message: "Đã làm sạch giỏ hàng" });
  }),
};

module.exports = CartController;
