const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Order = {
  create: async (orderData, items) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const orderId = generateId();
      await connection.query(
        `INSERT INTO orders 
        (id, user_id, voucher_id, subtotal, discount_amount, total_price, receiver_name, phone_number, shipping_address, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderId,
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
      if (orderData.voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?`,
          [orderData.voucher_id],
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
      SELECT o.*, u.name as customer_name, v.code as voucher_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      ORDER BY o.created_at DESC
    `);
    return rows;
  },

  getByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  },

  getById: async (id) => {
    const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) return null;

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
        [id, userId]
      );
      
      if (orders.length === 0) {
        throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền hủy.");
      }
      
      const order = orders[0];
      if (order.status !== 'pending') {
        throw new Error("Chỉ có thể hủy đơn hàng đang chờ xác nhận.");
      }

      await connection.query(
        `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
        [id]
      );

      const [items] = await connection.query(
        `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
        [id]
      );
      
      for (const item of items) {
        if (item.variant_id) {
          await connection.query(
            `UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
            [item.quantity, item.variant_id]
          );
        }
      }

      if (order.voucher_id) {
        await connection.query(
          `UPDATE vouchers SET used_count = used_count - 1 WHERE id = ? AND used_count > 0`,
          [order.voucher_id]
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
