const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Product = {
  create: async (productData, variants, images) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const productId = generateId();
      await connection.query(
        "INSERT INTO products (id, name, description, category_id, brand_id, status, discount_percent, sale_start, sale_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          productId,
          productData.name,
          productData.description,
          productData.category_id,
          productData.brand_id || null,
          "active",
          productData.discount_percent || 0,
          productData.sale_start || null,
          productData.sale_end || null,
        ],
      );

      if (variants && variants.length > 0) {
        const variantValues = variants.map((v) => [
          generateId(),
          productId,
          v.size,
          v.color,
          v.price || 0,
          v.stock || 0,
        ]);
        await connection.query(
          "INSERT INTO product_variants (id, product_id, size, color, price, stock) VALUES ?",
          [variantValues],
        );
      }

      if (images && images.length > 0) {
        const imageValues = images.map((img) => [
          generateId(),
          productId,
          img.image_url,
          img.color || null,
          img.is_thumbnail === true ||
          img.is_thumbnail === "true" ||
          img.is_thumbnail === 1
            ? 1
            : 0,
        ]);
        await connection.query(
          "INSERT INTO product_images (id, product_id, image_url, color, is_thumbnail) VALUES ?",
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
      SELECT p.*, b.name as brand_name, c.name as category_name, s.name as sport_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
             (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
             IF(p.sale_start <= NOW() AND p.sale_end >= NOW(), p.discount_percent, 0) as active_discount
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sports s ON c.sport_id = s.id
    `);
    return rows;
  },

  getById: async (id) => {
    const [product] = await db.query(
      `SELECT p.*, b.name as brand_name, 
              c.name as category_name, c.parent_id,
              pc.name as parent_category_name, 
              s.name as sport_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       LEFT JOIN sports s ON c.sport_id = s.id
       WHERE p.id = ?`,
      [id],
    );
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

  update: async (id, data, variants, images) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE products SET name=?, description=?, category_id=?, brand_id=?, status=?, discount_percent=?, sale_start=?, sale_end=? WHERE id=?",
        [
          data.name,
          data.description,
          data.category_id,
          data.brand_id || null,
          data.status || "active",
          data.discount_percent || 0,
          data.sale_start || null,
          data.sale_end || null,
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
              "UPDATE product_variants SET size=?, color=?, price=?, stock=? WHERE id=?",
              [
                variant.size,
                variant.color,
                variant.price || 0,
                variant.stock || 0,
                variant.id,
              ],
            );
          } else {
            await connection.query(
              "INSERT INTO product_variants (id, product_id, size, color, price, stock) VALUES (?, ?, ?, ?, ?, ?)",
              [
                generateId(),
                id,
                variant.size,
                variant.color,
                variant.price || 0,
                variant.stock || 0,
              ],
            );
          }
        }
      }

      if (images && images.length > 0) {
        await connection.query(
          "DELETE FROM product_images WHERE product_id = ?",
          [id],
        );
        const imageValues = images.map((img) => [
          generateId(),
          id,
          img.image_url,
          img.color || null,
          img.is_thumbnail === true ||
          img.is_thumbnail === "true" ||
          img.is_thumbnail === 1
            ? 1
            : 0,
        ]);
        await connection.query(
          "INSERT INTO product_images (id, product_id, image_url, color, is_thumbnail) VALUES ?",
          [imageValues],
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

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Product;
