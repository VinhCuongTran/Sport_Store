const OrderModel = require("../models/order.model");
const CartModel = require("../models/cart.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const db = require("../utils/mysql.db");

const OrderController = {
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
    if (voucher_id) {
      const [usedVoucher] = await db.query(
        "SELECT id FROM orders WHERE user_id = ? AND voucher_id = ? LIMIT 1",
        [user_id, voucher_id],
      );

      if (usedVoucher && usedVoucher.length > 0) {
        throw new ApiError(
          400,
          "Tài khoản của bạn đã sử dụng mã giảm giá này cho một đơn hàng trước đó!",
        );
      }
    }
    for (const item of items) {
      const [variantInfo] = await db.query(
        "SELECT stock FROM product_variants WHERE id = ?",
        [item.variant_id],
      );
      if (!variantInfo || variantInfo.length === 0) {
        throw new ApiError(
          400,
          `Sản phẩm "${item.product_name}" không tồn tại.`,
        );
      }
      if (variantInfo[0].stock < item.quantity) {
        throw new ApiError(
          400,
          `Sản phẩm "${item.product_name}" không đủ hàng. (Kho còn ${variantInfo[0].stock})`,
        );
      }
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

    if (is_from_cart) {
      const cartId = await CartModel.getCartIdByUserId(user_id);
      await CartModel.clearCart(cartId);
    }

    res.status(201).json({
      message: "Đặt hàng thành công",
      order_id: orderId,
    });
  }),

  getAllOrders: asyncHandler(async (req, res) => {
    const orders = await OrderModel.getAll();
    res.json(orders);
  }),

  getUserOrders: asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const orders = await OrderModel.getByUserId(userId);
    res.json(orders);
  }),

  getOrderById: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const order = await OrderModel.getById(orderId);
    if (!order) {
      throw new ApiError(404, "Không tìm thấy đơn hàng");
    }
    res.json(order);
  }),

  updateOrderStatus: asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    let { status, payment_status } = req.body;
    const staff_id = req.user.id;

    if (!status || !payment_status) {
      throw new ApiError(
        400,
        "Vui lòng cung cấp trạng thái đơn hàng và trạng thái thanh toán",
      );
    }
    if (status === "completed") {
      payment_status = "paid";
    }

    const isUpdated = await OrderModel.updateStatus(
      orderId,
      status,
      payment_status,
      staff_id,
    );

    if (!isUpdated) {
      throw new ApiError(404, "Không tìm thấy đơn hàng để cập nhật");
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  }),

  cancelOrder: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; 

    try {
      await OrderModel.cancelOrder(orderId, userId);
      res.json({ message: "Hủy đơn hàng thành công" });
    } catch (error) {
      throw new ApiError(400, error.message || "Không thể hủy đơn hàng này");
    }
  }),
};

module.exports = OrderController;
