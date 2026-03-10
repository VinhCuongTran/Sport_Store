const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Cart = {
  getCartIdByUserId: async (userId) => {
    const [rows] = await db.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length > 0) return rows[0].id;

    const id = generateId();
    await db.query("INSERT INTO carts (id, user_id) VALUES (?, ?)", [
      id,
      userId,
    ]);
    return id;
  },

  getCartItems: async (cartId) => {
    const [rows] = await db.query(
      `SELECT ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.quantity,
              p.name as product_name, 
              pv.size, pv.color, pv.price as variant_price, pv.stock,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = TRUE LIMIT 1) as thumbnail
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = ?`,
      [cartId],
    );
    return rows;
  },

  addItem: async (cartId, productId, variantId, quantity) => {
    const [existing] = await db.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id = ?",
      [cartId, productId, variantId],
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQuantity,
        existing[0].id,
      ]);
      return existing[0].id;
    } else {
      const id = generateId();
      await db.query(
        "INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?, ?)",
        [id, cartId, productId, variantId, quantity],
      );
      return id;
    }
  },

  updateItemQuantity: async (cartItemId, quantity) => {
    const [result] = await db.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, cartItemId],
    );
    return result.affectedRows > 0;
  },

  removeItem: async (cartItemId) => {
    const [result] = await db.query("DELETE FROM cart_items WHERE id = ?", [
      cartItemId,
    ]);
    return result.affectedRows > 0;
  },

  clearCart: async (cartId) => {
    const [result] = await db.query(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cartId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = Cart;
