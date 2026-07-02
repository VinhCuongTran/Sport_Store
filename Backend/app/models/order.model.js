const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Order = {
  create: async (orderData, items) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const orderId = generateId();
      await connection.query(
        // Đã thêm payment_status vào cột và tham số VALUES
        `INSERT INTO orders 
        (id, user_id, voucher_id, shipping_voucher_id, subtotal, shipping_fee, discount_amount, shipping_discount, total_price, receiver_name, phone_number, shipping_address, payment_method, status, payment_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          orderId,
          orderData.user_id,
          orderData.voucher_id || null,
          orderData.shipping_voucher_id || null,
          orderData.subtotal,
          orderData.shipping_fee || 0,
          orderData.discount_amount || 0,
          orderData.shipping_discount || 0,
          orderData.total_price,
          orderData.receiver_name,
          orderData.phone_number,
          orderData.shipping_address,
          orderData.payment_method || "Cash",
          orderData.payment_status || "unpaid" // Nhận 'paid' nếu là Chuyển khoản
        ]
      );

      if (items && items.length > 0) {
        const orderItemsData = items.map((item) => [
          generateId(),
          orderId,
          item.product_id,
          item.variant_id,
          item.quantity,
          item.price,
        ]);

        await connection.query(
          `INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price) VALUES ?`,
          [orderItemsData],
        );

        for (const item of items) {
          if (item.variant_id) {
            await connection.query(
              `UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`,
              [item.quantity, item.variant_id, item.quantity],
            );
          }
        }
      }

      // Tăng lượt sử dụng cho Voucher Sản phẩm
      if (orderData.voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?`,
          [orderData.voucher_id],
        );
      }

      // Tăng lượt sử dụng cho Voucher Vận chuyển
      if (orderData.shipping_voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?`,
          [orderData.shipping_voucher_id],
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT o.*, u.name as customer_name, v1.code as voucher_code, v2.code as shipping_voucher_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN vouchers v1 ON o.voucher_id = v1.id
      LEFT JOIN vouchers v2 ON o.shipping_voucher_id = v2.id
      ORDER BY o.created_at DESC
    `);
    return rows;
  },

  getByUserId: async (userId) => {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );

    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name as product_name, pv.size, pv.color,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as image_url,
          EXISTS(SELECT 1 FROM reviews r WHERE r.user_id = ? AND r.product_id = oi.product_id) as is_reviewed
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_variants pv ON oi.variant_id = pv.id
         WHERE oi.order_id = ?`,
        [userId, order.id], // Đưa userId vào đây cho dấu ? đầu tiên
      );

      order.items = items.map((item) => ({
        ...item,
        is_reviewed: !!item.is_reviewed,
      }));
    }

    return orders;
  },

  getById: async (id) => {
    const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) return null;

    // Lấy user_id từ đơn hàng vừa tìm được
    const orderUserId = orders[0].user_id;

    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, pv.size, pv.color,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as image_url,
        EXISTS(SELECT 1 FROM reviews r WHERE r.user_id = ? AND r.product_id = oi.product_id) as is_reviewed
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE oi.order_id = ?`,
      [orderUserId, id], // Truyền orderUserId vào cho dấu ? đầu tiên
    );

    const formattedItems = items.map((item) => ({
      ...item,
      is_reviewed: !!item.is_reviewed,
    }));

    return { ...orders[0], items: formattedItems };
  },

  updateStatus: async (id, status, payment_status, staffId = null) => {
    const [result] = await db.query(
      `UPDATE orders 
       SET status = ?, payment_status = ?, staff_id = COALESCE(?, staff_id) 
       WHERE id = ?`,
      [status, payment_status, staffId, id],
    );
    return result.affectedRows > 0;
  },

  cancelOrder: async (id, userId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [orders] = await connection.query(
        `SELECT * FROM orders WHERE id = ? AND user_id = ? FOR UPDATE`,
        [id, userId],
      );

      if (orders.length === 0) {
        throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền hủy.");
      }

      const order = orders[0];
      if (order.status !== "pending") {
        throw new Error("Chỉ có thể hủy đơn hàng đang chờ xác nhận.");
      }

      await connection.query(
        `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
        [id],
      );

      const [items] = await connection.query(
        `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
        [id],
      );

      for (const item of items) {
        if (item.variant_id) {
          await connection.query(
            `UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
            [item.quantity, item.variant_id],
          );
        }
      }

      // Hoàn lượt dùng Voucher sản phẩm
      if (order.voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count - 1 WHERE id = ? AND used_count > 0`,
          [order.voucher_id],
        );
      }

      // Hoàn lượt dùng Voucher vận chuyển
      if (order.shipping_voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count - 1 WHERE id = ? AND used_count > 0`,
          [order.shipping_voucher_id],
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = Order;
