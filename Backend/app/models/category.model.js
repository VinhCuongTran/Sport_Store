const db = require("../utils/mysql.db");

const Category = {
  create: async (data) => {
    const [result] = await db.query(
      "INSERT INTO categories (name, parent_id) VALUES (?, ?)",
      [data.name, data.parent_id || null],
    );
    return result.insertId;
  },
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM categories");
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    return rows.length > 0 ? rows[0] : null;
  },
  update: async (id, data) => {
    const [result] = await db.query(
      "UPDATE categories SET name = ?, parent_id = ? WHERE id = ?",
      [data.name, data.parent_id || null, id],
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = Category;
