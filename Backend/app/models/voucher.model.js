const db = require("../utils/mysql.db");

const Voucher = {
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO vouchers 
      (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.discount_type,
        data.discount_value,
        data.min_order_value || 0,
        data.max_discount || null,
        data.usage_limit || null,
        data.start_date,
        data.end_date,
      ],
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM vouchers ORDER BY created_at DESC",
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM vouchers WHERE id = ?", [id]);
    return rows[0];
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE vouchers 
       SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, 
           max_discount = ?, usage_limit = ?, start_date = ?, end_date = ? 
       WHERE id = ?`,
      [
        data.code,
        data.discount_type,
        data.discount_value,
        data.min_order_value || 0,
        data.max_discount || null,
        data.usage_limit || null,
        data.start_date,
        data.end_date,
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM vouchers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Voucher;
