const db = require("../utils/mysql.db");

const Review = {
  // Thêm đánh giá mới
  create: async (data) => {
    const [result] = await db.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [data.product_id, data.user_id, data.rating, data.comment || null],
    );
    return result.insertId;
  },

  // Lấy tất cả đánh giá (Dành cho Admin - JOIN với bảng products và users để lấy tên)
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

  // Lấy đánh giá của 1 sản phẩm cụ thể (Dành cho Client hiển thị ở trang chi tiết SP)
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

  // Kiểm tra xem user đã đánh giá sản phẩm này chưa (Tránh spam 1 người đánh giá nhiều lần)
  checkUserReviewed: async (productId, userId) => {
    const [rows] = await db.query(
      "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
      [productId, userId],
    );
    return rows.length > 0;
  },

  // Xóa đánh giá (Dành cho Admin nếu comment thô tục)
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Review;
