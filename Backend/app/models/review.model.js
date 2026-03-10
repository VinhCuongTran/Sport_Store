const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Review = {
  create: async (data) => {
    const id = generateId();
    const [result] = await db.query(
      "INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [id, data.product_id, data.user_id, data.rating, data.comment || null],
    );
    return id;
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT r.*, p.name as product_name, u.name as user_name, u.avatar as user_avatar 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  },

  getByProductId: async (productId) => {
    const [rows] = await db.query(
      `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `,
      [productId],
    );
    return rows;
  },

  checkUserReviewed: async (productId, userId) => {
    const [rows] = await db.query(
      "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
      [productId, userId],
    );
    return rows.length > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Review;
