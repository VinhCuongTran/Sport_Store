const db = require("../utils/mysql.db");

const Product = {
  create: async (productData, variants, images) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [productResult] = await connection.query(
        "INSERT INTO products (name, description, price, category_id, sport_id, brand_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          productData.name,
          productData.description,
          productData.price,
          productData.category_id,
          productData.sport_id || null,
          productData.brand_id,
          "active",
        ],
      );
      const productId = productResult.insertId;

      if (variants && variants.length > 0) {
        const variantValues = variants.map((v) => [
          productId,
          v.size,
          v.color,
          v.price,
          v.stock,
        ]);
        await connection.query(
          "INSERT INTO product_variants (product_id, size, color, price, stock) VALUES ?",
          [variantValues],
        );
      }

      if (images && images.length > 0) {
        const imageValues = images.map((img) => [
          productId,
          img.image_url,
          img.is_thumbnail,
        ]);
        await connection.query(
          "INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES ?",
          [imageValues],
        );
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getAll: async () => {
    const [rows] = await db.query(`
            SELECT p.*, b.name as brand_name, c.name as category_name, s.name as sport_name, i.image_url as thumbnail
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sports s ON p.sport_id = s.id
            LEFT JOIN product_images i ON p.id = i.product_id AND i.is_thumbnail = TRUE
        `);
    return rows;
  },

  getById: async (id) => {
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (product.length === 0) return null;

    const [variants] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [id],
    );
    const [images] = await db.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [id],
    );

    return { ...product[0], variants, images };
  },

  update: async (id, data, variants) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE products SET name=?, description=?, price=?, category_id=?, sport_id=?, brand_id=?, status=? WHERE id=?",
        [
          data.name,
          data.description,
          data.price,
          data.category_id,
          data.sport_id || null,
          data.brand_id,
          data.status || "active",
          id,
        ],
      );

      if (variants && Array.isArray(variants)) {
        const [existingVariants] = await connection.query(
          "SELECT id FROM product_variants WHERE product_id = ?",
          [id],
        );
        const existingIds = existingVariants.map((v) => v.id);
        const incomingIds = variants.filter((v) => v.id).map((v) => v.id);
        const idsToDelete = existingIds.filter(
          (vId) => !incomingIds.includes(vId),
        );
        if (idsToDelete.length > 0) {
          await connection.query(
            "DELETE FROM product_variants WHERE id IN (?)",
            [idsToDelete],
          );
        }
        for (const variant of variants) {
          if (variant.id) {
            await connection.query(
              "UPDATE product_variants SET stock=? WHERE id=?",
              [variant.stock || 0, variant.id],
            );
          } else {
            await connection.query(
              "INSERT INTO product_variants (product_id, size, color, price, stock) VALUES (?, ?, ?, ?, ?)",
              [
                id,
                variant.size,
                variant.color,
                variant.price || null,
                variant.stock || 0,
              ],
            );
          }
        }
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

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Product;
