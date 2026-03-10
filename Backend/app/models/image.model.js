const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Image = {
  create: async (data) => {
    const id = generateId();
    const [result] = await db.query(
      "INSERT INTO product_images (id, product_id, image_url, is_thumbnail) VALUES (?, ?, ?, ?)",
      [id, data.product_id, data.image_url, data.is_thumbnail || false],
    );
    return id;
  },
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM product_images WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
  setThumbnail: async (product_id, image_id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?",
        [product_id],
      );
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
