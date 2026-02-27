const db = require("../utils/mysql.db");

const Image = {
  create: async (data) => {
    const [result] = await db.query(
      "INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)",
      [data.product_id, data.image_url, data.is_thumbnail || false],
    );
    return result.insertId;
  },
  // Xóa một ảnh cụ thể
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM product_images WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
  // Đặt một ảnh làm ảnh đại diện (thumbnail) chính
  setThumbnail: async (product_id, image_id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Đặt tất cả ảnh của sản phẩm này thành false
      await connection.query(
        "UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?",
        [product_id],
      );
      // Đặt ảnh được chọn thành true
      await connection.query(
        "UPDATE product_images SET is_thumbnail = TRUE WHERE id = ?",
        [image_id],
      );
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

module.exports = Image;
