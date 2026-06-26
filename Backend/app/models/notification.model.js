// Backend/app/models/notification.model.js
const db = require("../utils/mysql.db");

class NotificationModel {
  async createAndLimit(userId, type, title, message, referenceId = null) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Thêm thông báo (Cập nhật câu query thêm cột reference_id)
      const insertQuery = `INSERT INTO notifications (user_id, type, title, message, reference_id) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await connection.query(insertQuery, [
        userId,
        type,
        title,
        message,
        referenceId, // Thêm biến này vào mảng tham số
      ]);

      // 2. Tự động xóa nếu vượt quá 50 thông báo (Giữ nguyên logic phía dưới...)
      const LIMIT = 50;
      const deleteQuery = `
                DELETE FROM notifications 
                WHERE user_id = ? AND id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM notifications 
                        WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
                    ) as keep_notifications
                )
            `;
      await connection.query(deleteQuery, [userId, userId, LIMIT]);

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    return rows;
  }

  async markAsRead(notificationId, userId) {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [notificationId, userId],
    );
  }
}

module.exports = new NotificationModel();
