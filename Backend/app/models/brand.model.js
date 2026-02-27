const db = require("../utils/mysql.db");

const Brand = {
  create: async (data) => {
    const [result] = await db.query(
      "INSERT INTO brands (name, logo_url) VALUES (?, ?)",
      [data.name, data.logo_url],
    );
    return result.insertId;
  },
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM brands");
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM brands WHERE id = ?", [id]);
    return rows[0];
  },
  update: async (id, data) => {
    const [result] = await db.query(
      "UPDATE brands SET name = ?, logo_url = ? WHERE id = ?",
      [data.name, data.logo_url, id],
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM brands WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Brand;
