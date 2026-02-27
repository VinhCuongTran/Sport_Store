const db = require("../utils/mysql.db");

const Sport = {
  create: async (data) => {
    const [result] = await db.query("INSERT INTO sports (name) VALUES (?)", [
      data.name,
    ]);
    return result.insertId;
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
