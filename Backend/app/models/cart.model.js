const db = require("../utils/mysql.db");

const Cart = {
  // Tìm giỏ hàng của user, nếu chưa có thì tự động tạo mới
  getCartIdByUserId: async (userId) => {
    const [rows] = await db.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length > 0) return rows[0].id;

    // Nếu user chưa có giỏ hàng, tạo mới
    const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [
      userId,
    ]);
    return result.insertId;
  },

  // Lấy chi tiết các sản phẩm trong giỏ hàng
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

  // Thêm sản phẩm vào giỏ hàng
  addItem: async (cartId, productId, variantId, quantity) => {
    // Kiểm tra xem sản phẩm với variant này đã có trong giỏ chưa
    const [existing] = await db.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id = ?",
      [cartId, productId, variantId],
    );

    if (existing.length > 0) {
      // Nếu đã có, cộng dồn số lượng
      const newQuantity = existing[0].quantity + quantity;
      await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQuantity,
        existing[0].id,
      ]);
      return existing[0].id;
    } else {
      // Nếu chưa có, tạo dòng mới
      const [result] = await db.query(
        "INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)",
        [cartId, productId, variantId, quantity],
      );
      return result.insertId;
    }
  },

  // Cập nhật số lượng của 1 item
  updateItemQuantity: async (cartItemId, quantity) => {
    const [result] = await db.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, cartItemId],
    );
    return result.affectedRows > 0;
  },

  // Xóa 1 item khỏi giỏ
  removeItem: async (cartItemId) => {
    const [result] = await db.query("DELETE FROM cart_items WHERE id = ?", [
      cartItemId,
    ]);
    return result.affectedRows > 0;
  },

  // Xóa toàn bộ giỏ hàng (khi đặt hàng thành công)
  clearCart: async (cartId) => {
    const [result] = await db.query(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cartId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = Cart;
