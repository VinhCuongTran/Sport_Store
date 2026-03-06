const pool = require("../utils/mysql.db");

const Address = {
  create: async (data) => {
    const [result] = await pool.query("INSERT INTO addresses SET ?", data);
    return result.insertId;
  },
  getByUser: async (userId) => {
    // Sắp xếp địa chỉ mặc định lên đầu
    const [rows] = await pool.query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", [userId]);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM addresses WHERE id = ?", [id]);
    return rows[0];
  },
  countByUser: async (userId) => {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM addresses WHERE user_id = ?", [userId]);
    return rows[0].count;
  },
  update: async (id, data) => {
    await pool.query("UPDATE addresses SET ? WHERE id = ?", [data, id]);
  },
  delete: async (id) => {
    await pool.query("DELETE FROM addresses WHERE id = ?", [id]);
  },
  unsetDefault: async (userId) => {
    // Tắt tất cả trạng thái mặc định của user này
    await pool.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  }
};

module.exports = Address;