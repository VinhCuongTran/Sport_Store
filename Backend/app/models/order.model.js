const db = require("../utils/mysql.db");

const Order = {
  // Tạo đơn hàng mới
  create: async (orderData, items) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Thêm dữ liệu vào bảng orders
      const [orderResult] = await connection.query(
        `INSERT INTO orders 
        (user_id, voucher_id, subtotal, discount_amount, total_price, receiver_name, phone_number, shipping_address, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderData.user_id,
          orderData.voucher_id || null,
          orderData.subtotal,
          orderData.discount_amount || 0,
          orderData.total_price,
          orderData.receiver_name,
          orderData.phone_number,
          orderData.shipping_address,
          orderData.payment_method || "Cash",
        ],
      );
      const orderId = orderResult.insertId;

      // 2. Thêm dữ liệu vào bảng order_items
      if (items && items.length > 0) {
        const orderItemsData = items.map((item) => [
          orderId,
          item.product_id,
          item.variant_id,
          item.quantity,
          item.price,
        ]);

        await connection.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES ?`,
          [orderItemsData],
        );

        // 3. Trừ số lượng tồn kho (stock) trong bảng product_variants
        for (const item of items) {
          if (item.variant_id) {
            await connection.query(
              `UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`,
              [item.quantity, item.variant_id, item.quantity],
            );
          }
        }
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

  // Lấy danh sách đơn hàng của một user
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  },

  // Lấy chi tiết 1 đơn hàng cụ thể
  getById: async (id) => {
    const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) return null;

    // Lấy kèm theo danh sách sản phẩm của đơn hàng đó
    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, pv.size, pv.color 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE oi.order_id = ?`,
      [id],
    );

    return { ...orders[0], items };
  },

  // Cập nhật trạng thái đơn hàng (Dành cho Admin/Staff)
  updateStatus: async (id, status, staffId = null) => {
    const [result] = await db.query(
      `UPDATE orders SET status = ?, staff_id = COALESCE(?, staff_id) WHERE id = ?`,
      [status, staffId, id],
    );
    return result.affectedRows > 0;
  },
};

module.exports = Order;
