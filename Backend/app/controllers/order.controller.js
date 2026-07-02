const OrderModel = require("../models/order.model");
const CartModel = require("../models/cart.model");
const ApiError = require("../utils/api.error");
const asyncHandler = require("../utils/async.handler");
const db = require("../utils/mysql.db");
const NotificationModel = require("../models/notification.model");
const { sendRealTimeNotification } = require("../../server");
const generateId = require("../utils/generate.id");
const {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} = require("../utils/send.email");

const OrderController = {
  createOrder: asyncHandler(async (req, res) => {
    const {
      user_id,
      receiver_name,
      phone_number,
      shipping_address,
      payment_method,
      voucher_id,
      shipping_voucher_id,
      subtotal,
      discount_amount,
      shipping_discount,
      items,
      is_from_cart,
    } = req.body;

    const shipping_fee =
      req.body.shipping_fee !== undefined ? Number(req.body.shipping_fee) : 0;

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
          "Bạn đã sử dụng mã giảm giá sản phẩm này cho một đơn hàng trước đó!",
        );
      }
    }

    if (shipping_voucher_id) {
      const [usedShippingVoucher] = await db.query(
        "SELECT id FROM orders WHERE user_id = ? AND shipping_voucher_id = ? LIMIT 1",
        [user_id, shipping_voucher_id],
      );
      if (usedShippingVoucher && usedShippingVoucher.length > 0) {
        throw new ApiError(
          400,
          "Bạn đã sử dụng mã miễn phí vận chuyển này cho một đơn hàng trước đó!",
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

    const final_subtotal = Number(subtotal) || 0;
    const final_discount = Number(discount_amount) || 0;
    const final_shipping_discount = Number(shipping_discount) || 0;

    let total_price =
      final_subtotal + shipping_fee - final_discount - final_shipping_discount;
    if (total_price < 0) total_price = 0;

    // --- LOGIC MỚI: XÁC ĐỊNH ONLINE PAYMENT ---
    const isOnlinePayment = ["BankTransfer", "VNPay", "Momo"].includes(
      payment_method,
    );
    const initialPaymentStatus = isOnlinePayment ? "paid" : "unpaid";

    const orderData = {
      user_id,
      voucher_id,
      shipping_voucher_id,
      subtotal: final_subtotal,
      shipping_fee,
      discount_amount: final_discount,
      shipping_discount: final_shipping_discount,
      total_price,
      receiver_name,
      phone_number,
      shipping_address,
      payment_method,
      payment_status: initialPaymentStatus, // Ép kiểu paid nếu chuyển khoản
    };

    const orderId = await OrderModel.create(orderData, items);

    // --- TẠO DÒNG THU TIỀN NGAY LẬP TỨC NẾU LÀ CHUYỂN KHOẢN ---
    if (isOnlinePayment) {
      try {
        const transId = generateId();
        await db.query(
          `INSERT INTO transactions (id, order_id, amount, transaction_type, payment_method, status, note) 
           VALUES (?, ?, ?, 'payment', ?, 'success', ?)`,
          [
            transId,
            orderId,
            total_price,
            payment_method,
            `Thu tiền đơn hàng #${orderId} (Khách đã chuyển khoản)`,
          ],
        );
      } catch (err) {
        console.error("Lỗi khi tạo dòng tiền thanh toán online:", err);
      }
    }

    if (is_from_cart) {
      const cartId = await CartModel.getCartIdByUserId(user_id);
      await CartModel.clearCart(cartId);
    }

    let buyerName = receiver_name;
    let buyerEmail = null;
    try {
      const [userData] = await db.query(
        "SELECT name, email FROM users WHERE id = ?",
        [user_id],
      );
      if (userData && userData.length > 0) {
        if (userData[0].name) buyerName = userData[0].name;
        if (userData[0].email) buyerEmail = userData[0].email;
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin tài khoản người mua:", err);
    }

    if (buyerEmail) {
      sendOrderConfirmation(buyerEmail, orderId, orderData, buyerName);
    }

    try {
      const [admins] = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'staff')",
      );
      if (admins && admins.length > 0) {
        const orderType = "new_order";
        const orderTitle = "Đơn hàng mới";
        const orderMessage = `Khách hàng ${buyerName} vừa đặt đơn hàng mới #${orderId}.`;

        for (const admin of admins) {
          const insertId = await NotificationModel.createAndLimit(
            admin.id,
            orderType,
            orderTitle,
            orderMessage,
            orderId,
          );
          if (typeof sendRealTimeNotification === "function") {
            sendRealTimeNotification(admin.id, {
              id: insertId,
              type: orderType,
              title: orderTitle,
              message: orderMessage,
              reference_id: orderId,
              is_read: false,
              created_at: new Date(),
            });
          }
        }

        const LOW_STOCK_THRESHOLD = 20;
        for (const item of items) {
          const [variantData] = await db.query(
            `SELECT pv.stock, p.name AS product_name FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = ?`,
            [item.variant_id],
          );

          if (variantData && variantData.length > 0) {
            const currentStock = variantData[0].stock;
            const productName = variantData[0].product_name;

            if (currentStock <= LOW_STOCK_THRESHOLD) {
              const lowStockTitle = "⚠️ Cảnh báo sắp hết hàng";
              const lowStockMessage = `Sản phẩm "${productName}" hiện chỉ còn ${currentStock} sản phẩm trong kho!`;

              for (const admin of admins) {
                const insertId = await NotificationModel.createAndLimit(
                  admin.id,
                  "system",
                  lowStockTitle,
                  lowStockMessage,
                  item.product_id,
                );
                if (typeof sendRealTimeNotification === "function") {
                  sendRealTimeNotification(admin.id, {
                    id: insertId,
                    type: "system",
                    title: lowStockTitle,
                    message: lowStockMessage,
                    reference_id: item.product_id,
                    is_read: false,
                    created_at: new Date(),
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông báo cho admin:", error);
    }

    res.status(201).json({ message: "Đặt hàng thành công", order_id: orderId });
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
    if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
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

    // Nếu đơn COD được giao thành công -> Tự đổi thành Đã thanh toán
    if (status === "completed") {
      payment_status = "paid";
    }

    const order = await OrderModel.getById(orderId);
    if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");

    const oldStatus = order.status;
    const oldPaymentStatus = order.payment_status;

    const isUpdated = await OrderModel.updateStatus(
      orderId,
      status,
      payment_status,
      staff_id,
    );

    if (!isUpdated)
      throw new ApiError(404, "Không tìm thấy đơn hàng để cập nhật");

    // --- XỬ LÝ DÒNG TIỀN THEO NGHIỆP VỤ ---
    try {
      // 1. TẠO DÒNG THU TIỀN KHI ĐƠN COD HOÀN THÀNH
      // Vì online payment đã được thu ngay lúc tạo đơn rồi
      const isCodPayment = ["COD", "Cash"].includes(order.payment_method);
      if (isCodPayment && status === "completed") {
        const [existingPayment] = await db.query(
          `SELECT id FROM transactions WHERE order_id = ? AND transaction_type = 'payment'`,
          [orderId],
        );

        if (existingPayment.length === 0) {
          const transId = generateId();
          await db.query(
            `INSERT INTO transactions (id, order_id, amount, transaction_type, payment_method, status, note) 
             VALUES (?, ?, ?, 'payment', ?, 'success', ?)`,
            [
              transId,
              orderId,
              order.total_price,
              order.payment_method,
              `Thu tiền đơn COD #${orderId} (Giao thành công)`,
            ],
          );
        }
      }

      // 2. TẠO DÒNG HOÀN TIỀN KHI HỦY ĐƠN ĐÃ THANH TOÁN (BankTransfer, VNPay, Momo...)
      if (status === "cancelled" && oldPaymentStatus === "paid") {
        const [existingRefund] = await db.query(
          `SELECT id FROM transactions WHERE order_id = ? AND transaction_type = 'refund'`,
          [orderId],
        );

        if (existingRefund.length === 0) {
          const refundId = generateId();
          await db.query(
            `INSERT INTO transactions (id, order_id, amount, transaction_type, payment_method, status, note) 
             VALUES (?, ?, ?, 'refund', ?, 'success', ?)`,
            [
              refundId,
              orderId,
              order.total_price,
              order.payment_method,
              `Hoàn trả tiền (Refund) cho đơn hàng #${orderId} bị hủy bởi Admin`,
            ],
          );
        }
      }
    } catch (transError) {
      console.error("Lỗi khi cập nhật trạng thái dòng tiền:", transError);
    }

    // Lưu lịch sử xuất kho
    if (status === "confirmed" && oldStatus === "pending") {
      try {
        const [orderItems] = await db.query(
          "SELECT variant_id, quantity FROM order_items WHERE order_id = ?",
          [orderId],
        );
        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            if (item.variant_id) {
              const logId = generateId();
              await db.query(
                "INSERT INTO inventory_logs (id, variant_id, type, quantity, reference_id, note) VALUES (?, ?, 'export', ?, ?, ?)",
                [
                  logId,
                  item.variant_id,
                  item.quantity,
                  orderId,
                  `Xuất kho cho đơn hàng #${orderId}`,
                ],
              );
            }
          }
        }
      } catch (logError) {
        console.error("Lỗi khi ghi log xuất kho:", logError);
      }
    }

    try {
      const userId = order.user_id;
      const type = "order";
      const reference_id = orderId;
      let title = "Cập nhật đơn hàng";
      let message = `Đơn hàng #${orderId} của bạn đã được chuyển sang trạng thái: ${status}`;

      if (status === "delivering")
        message = `Đơn hàng #${orderId} của bạn đang được giao đến bạn.`;
      if (status === "completed")
        message = `Đơn hàng #${orderId} đã giao thành công. Cảm ơn bạn!`;
      if (status === "cancelled")
        message = `Đơn hàng #${orderId} của bạn đã bị hủy.`;

      const insertId = await NotificationModel.createAndLimit(
        userId,
        type,
        title,
        message,
        reference_id,
      );
      sendRealTimeNotification(userId, {
        id: insertId,
        type,
        title,
        message,
        reference_id,
        is_read: false,
        created_at: new Date(),
      });

      const [userData] = await db.query(
        "SELECT name, email FROM users WHERE id = ?",
        [userId],
      );
      if (userData && userData.length > 0 && userData[0].email) {
        const statusBuyerName = userData[0].name || "Khách hàng";
        sendOrderStatusUpdate(
          userData[0].email,
          orderId,
          status,
          statusBuyerName,
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  }),

  cancelOrder: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    try {
      const order = await OrderModel.getById(orderId);
      if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");

      await OrderModel.cancelOrder(orderId, userId);

      // --- TẠO DÒNG HOÀN TIỀN NẾU KHÁCH TỰ HỦY ĐƠN ĐÃ THANH TOÁN ---
      // Áp dụng cho BankTransfer, Momo, VNPay đã được mark là "paid" lúc tạo đơn
      if (order.payment_status === "paid") {
        const [existingRefund] = await db.query(
          `SELECT id FROM transactions WHERE order_id = ? AND transaction_type = 'refund'`,
          [orderId],
        );

        if (existingRefund.length === 0) {
          const refundId = generateId();
          await db.query(
            `INSERT INTO transactions (id, order_id, amount, transaction_type, payment_method, status, note) 
             VALUES (?, ?, ?, 'refund', ?, 'success', ?)`,
            [
              refundId,
              orderId,
              order.total_price,
              order.payment_method,
              `Hoàn trả tiền (Refund) cho đơn hàng #${orderId} do khách tự hủy`,
            ],
          );
        }
      }

      res.json({ message: "Hủy đơn hàng thành công" });
    } catch (error) {
      throw new ApiError(400, error.message || "Không thể hủy đơn hàng này");
    }
  }),
};

module.exports = OrderController;
