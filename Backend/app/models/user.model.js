const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const User = {
  create: async (data) => {
    const id = generateId();
    const [result] = await db.query(
      "INSERT INTO users (id, name, email, phone_number, password, gender, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        data.name,
        data.email,
        data.phone_number || null,
        data.password,
        data.gender || "other",
        data.avatar || null,
        data.role || "customer",
        data.status || "active",
      ],
    );
    return id;
  },

  getAll: async () => {
    const [rows] = await db.query(
      "SELECT id, name, email, phone_number, gender, avatar, role, status, created_at, updated_at FROM users",
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT id, name, email, phone_number, gender, avatar, role, status, created_at, updated_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  findByIdentifier: async (identifier) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone_number = ?",
      [identifier, identifier],
    );
    return rows[0];
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           email = COALESCE(?, email), 
           phone_number = COALESCE(?, phone_number), 
           password = COALESCE(?, password),
           gender = COALESCE(?, gender),
           avatar = COALESCE(?, avatar), 
           role = COALESCE(?, role), 
           status = COALESCE(?, status) 
       WHERE id = ?`,
      [
        data.name ?? null,
        data.email ?? null,
        data.phone_number ?? null,
        data.password ?? null,
        data.gender ?? null,
        data.avatar ?? null,
        data.role ?? null,
        data.status ?? null,
        id,
      ],
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;
