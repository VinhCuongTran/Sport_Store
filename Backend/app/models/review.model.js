const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Review = {
  create: async (data) => {
    const id = generateId();
    // Đã bổ sung thêm ai_probs vào câu lệnh SQL
    await db.query(
      "INSERT INTO reviews (id, product_id, user_id, rating, comment, status, ai_label, ai_confidence, ai_probs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        data.product_id,
        data.user_id,
        data.rating,
        data.comment || null,
        data.status || "approved",
        data.ai_label || null,
        data.ai_confidence || null,
        data.ai_probs || null,
      ],
    );
    return id;
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        r.*, 
        p.name as product_name, 
        u.name as user_name, 
        u.avatar as user_avatar,
        DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i') as purchase_date,
        (SELECT COUNT(id) FROM reviews r2 WHERE r2.user_id = r.user_id AND r2.created_at < r.created_at) as previous_reviews_count
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
      SELECT 
        r.*, 
        u.name as user_name, 
        u.avatar as user_avatar,
        DATE_FORMAT(r.created_at, '%d/%m/%Y') as purchase_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'approved'
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

  updateStatus: async (id, status) => {
    const [result] = await db.query(
      "UPDATE reviews SET status = ? WHERE id = ?",
      [status, id],
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Review;
