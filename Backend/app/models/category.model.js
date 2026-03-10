const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Category = {
  create: async (data) => {
    const id = generateId();
    const [result] = await db.query(
      "INSERT INTO categories (id, name, parent_id, sport_id) VALUES (?, ?, ?, ?)",
      [id, data.name, data.parent_id || null, data.sport_id || null],
    );
    return id;
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
      "UPDATE categories SET name = ?, parent_id = ?, sport_id = ? WHERE id = ?",
      [data.name, data.parent_id || null, data.sport_id || null, id],
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
