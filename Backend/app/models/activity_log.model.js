// models/activity_log.model.js
const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const ActivityLog = {
  // Hàm ghi lại hành động
  logAction: async (userId, action, description, targetId = null) => {
    try {
      const logId = generateId();
      await db.query(
        `INSERT INTO activity_logs (id, user_id, action, description, target_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [logId, userId, action, description, targetId]
      );
      return true;
    } catch (error) {
      console.error("Lỗi khi ghi Activity Log:", error);
      return false; // Không throw error để tránh làm hỏng luồng chính đang chạy
    }
  },

  // Hàm lấy danh sách log cho Admin xem
  getAllLogs: async () => {
    const [rows] = await db.query(`
      SELECT al.*, u.name as user_name, u.role 
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `);
    return rows;
  }
};

module.exports = ActivityLog;