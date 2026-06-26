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

    // Lấy phí vận chuyển từ FE, mặc định là 0 nếu không có
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

    // Kiểm tra trùng lặp Voucher Sản phẩm
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

    // Kiểm tra trùng lặp Voucher Vận chuyển
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

    // Kiểm tra kho hàng
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

    // Tính toán lại tổng tiền để đảm bảo tính chính xác (Ép kiểu Number)
    const final_subtotal = Number(subtotal) || 0;
    const final_discount = Number(discount_amount) || 0;
    const final_shipping_discount = Number(shipping_discount) || 0;

    // Tổng tiền = Giá gốc + Phí ship - Giảm giá SP - Giảm giá ship
    let total_price =
      final_subtotal + shipping_fee - final_discount - final_shipping_discount;
    if (total_price < 0) total_price = 0; // Đảm bảo tổng tiền không bị âm

    // Chỉ khai báo orderData MỘT LẦN duy nhất
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
    };

    // Chỉ tạo orderId MỘT LẦN duy nhất
    const orderId = await OrderModel.create(orderData, items);

    if (is_from_cart) {
      const cartId = await CartModel.getCartIdByUserId(user_id);
      await CartModel.clearCart(cartId);
    }

    // --- BẮT ĐẦU: LẤY THÔNG TIN CHỦ TÀI KHOẢN ---
    let buyerName = receiver_name; // Fallback mặc định là tên người nhận hộ
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

    // --- BẮT ĐẦU: GỬI EMAIL XÁC NHẬN CHO KHÁCH HÀNG (CHẠY NGẦM) ---
    if (buyerEmail) {
      sendOrderConfirmation(buyerEmail, orderId, orderData, buyerName);
    }

    // --- XỬ LÝ GỬI THÔNG BÁO CHO ADMIN ---
    try {
      const [admins] = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'staff')",
      );

      if (admins && admins.length > 0) {
        // 1. GỬI THÔNG BÁO: ĐƠN HÀNG MỚI (Đã đổi sang buyerName của tài khoản đặt)
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

        // 2. GỬI THÔNG BÁO: CẢNH BÁO SẮP HẾT HÀNG
        const LOW_STOCK_THRESHOLD = 20; // Ngưỡng cảnh báo

        for (const item of items) {
          // Dùng JOIN để lấy luôn số lượng tồn kho VÀ tên sản phẩm từ CSDL
          const [variantData] = await db.query(
            `SELECT pv.stock, p.name AS product_name 
             FROM product_variants pv 
             JOIN products p ON pv.product_id = p.id 
             WHERE pv.id = ?`,
            [item.variant_id],
          );

          if (variantData && variantData.length > 0) {
            const currentStock = variantData[0].stock;
            const productName = variantData[0].product_name; // Lấy tên từ CSDL

            // Nếu tồn kho rơi xuống mức cảnh báo
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

    // Lấy thông tin đơn hàng
    const order = await OrderModel.getById(orderId);
    if (!order) {
      throw new ApiError(404, "Không tìm thấy đơn hàng");
    }

    // Trạng thái cũ của đơn hàng để so sánh
    const oldStatus = order.status;

    const isUpdated = await OrderModel.updateStatus(
      orderId,
      status,
      payment_status,
      staff_id,
    );

    if (!isUpdated) {
      throw new ApiError(404, "Không tìm thấy đơn hàng để cập nhật");
    }

    // --- BẮT ĐẦU: LƯU LỊCH SỬ XUẤT KHO KHI XÁC NHẬN ĐƠN ---
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
    // --- KẾT THÚC: LƯU LỊCH SỬ XUẤT KHO ---

    // --- BẮT ĐẦU: XỬ LÝ THÔNG BÁO NỘI BỘ VÀ EMAIL ---
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

      // --- BẮT ĐẦU: GỬI EMAIL CẬP NHẬT TRẠNG THÁI CHO KHÁCH (CHẠY NGẦM) ---
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
      // --- KẾT THÚC: GỬI EMAIL CẬP NHẬT TRẠNG THÁI ---
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
    }
    // --- KẾT THÚC: XỬ LÝ THÔNG BÁO ---

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
