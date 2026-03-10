const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const Sport = {
  create: async (data) => {
    const id = generateId();
    const [result] = await db.query(
      "INSERT INTO sports (id, name) VALUES (?, ?)",
      [id, data.name],
    );
    return id;
  },
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM sports");
    return rows;
  },
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM sports WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  update: async (id, data) => {
    const [result] = await db.query("UPDATE sports SET name = ? WHERE id = ?", [
      data.name,
      id,
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM sports WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Sport;
