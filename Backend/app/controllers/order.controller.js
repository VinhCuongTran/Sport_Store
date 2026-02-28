const OrderModel = require("../models/order.model");
const CartModel = require("../models/cart.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");

const OrderController = {
  // Đặt hàng
  createOrder: asyncHandler(async (req, res) => {
    const {
      user_id,
      receiver_name,
      phone_number,
      shipping_address,
      payment_method,
      voucher_id,
      subtotal,
      discount_amount,
      total_price,
      items,
      is_from_cart,
    } = req.body;

    if (
      !user_id ||
      !receiver_name ||
      !phone_number ||
      !shipping_address ||
      !items ||
      items.length === 0
    ) {
      throw new ApiError(
        400,
        "Vui lòng cung cấp đủ thông tin đặt hàng (người nhận, sđt, địa chỉ và danh sách sản phẩm)",
      );
    }

    const orderData = {
      user_id,
      voucher_id,
      subtotal,
      discount_amount,
      total_price,
      receiver_name,
      phone_number,
      shipping_address,
      payment_method,
    };

    const orderId = await OrderModel.create(orderData, items);

    // Nếu người dùng đặt hàng từ Giỏ hàng -> Xóa giỏ hàng sau khi đặt thành công
    if (is_from_cart) {
      const cartId = await CartModel.getCartIdByUserId(user_id);
      await CartModel.clearCart(cartId);
    }

    res.status(201).json({
      message: "Đặt hàng thành công",
      order_id: orderId,
    });
  }),

  // Lấy lịch sử đơn hàng của User
  getUserOrders: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const orders = await OrderModel.getByUserId(userId);
    res.json(orders);
  }),

  // Xem chi tiết đơn hàng
  getOrderById: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const order = await OrderModel.getById(orderId);
    if (!order) {
      throw new ApiError(404, "Không tìm thấy đơn hàng");
    }
    res.json(order);
  }),

  // Cập nhật trạng thái đơn hàng (Dành cho Staff/Admin)
  updateOrderStatus: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status, staff_id } = req.body;

    if (!status) {
      throw new ApiError(400, "Vui lòng cung cấp trạng thái mới");
    }

    const isUpdated = await OrderModel.updateStatus(orderId, status, staff_id);
    if (!isUpdated) {
      throw new ApiError(404, "Không tìm thấy đơn hàng để cập nhật");
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  }),
};

module.exports = OrderController;
