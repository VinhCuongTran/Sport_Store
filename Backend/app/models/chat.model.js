const db = require("../utils/mysql.db");
const generateId = require("../utils/generate.id");

const ChatModel = {
  saveMessage: async (data) => {
    const id = generateId();
    const query = `
      INSERT INTO messages (id, sender_id, receiver_id, order_id, product_id, content) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      data.sender_id,
      data.receiver_id,
      data.order_id || null,
      data.product_id || null, // Lưu thêm product_id
      data.content,
    ];

    await db.query(query, values);

    // Truy vấn ngược lại để lấy kèm thông tin SP/Đơn hàng trả về qua Socket
    const [saved] = await db.query(
      `SELECT m.*, p.name AS product_name, 
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) AS product_image
       FROM messages m
       LEFT JOIN products p ON m.product_id = p.id
       WHERE m.id = ?`,
      [id],
    );

    return saved[0];
  },

  getConversation: async (userId1, userId2) => {
    const [rows] = await db.query(
      `SELECT m.*, 
              p.name AS product_name, 
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) AS product_image
       FROM messages m
       LEFT JOIN products p ON m.product_id = p.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId1, userId2, userId2, userId1],
    );
    return rows;
  },

  markAsRead: async (senderId, receiverId) => {
    await db.query(
      `UPDATE messages SET is_read = 1 
       WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
      [senderId, receiverId],
    );
  },

  getContacts: async (userId, role) => {
    if (role === "customer") {
      const [admins] = await db.query(
        `SELECT id, name, avatar FROM users WHERE role IN ('admin', 'staff') LIMIT 1`,
      );
      if (admins.length === 0) return [];
      const admin = admins[0];

      // Lấy tin nhắn cuối cùng (Xem trước)
      const [lastMsg] = await db.query(
        `SELECT sender_id, content FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
         ORDER BY created_at DESC LIMIT 1`,
        [userId, admin.id, admin.id, userId],
      );

      // Đếm số tin chưa đọc
      const [unread] = await db.query(
        `SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
        [admin.id, userId],
      );

      return [
        {
          id: admin.id,
          name: "CSKH - " + admin.name,
          avatar: admin.avatar || "https://placehold.co/100",
          last_message:
            lastMsg.length > 0 ? lastMsg[0].content : "Sẵn sàng hỗ trợ bạn!",
          last_sender_id: lastMsg.length > 0 ? lastMsg[0].sender_id : null,
          is_online: false, // sẽ do Socket cập nhật real-time
          unread: unread[0].count || 0,
        },
      ];
    } else {
      // DÀNH CHO ADMIN
      const [customers] = await db.query(
        `SELECT DISTINCT u.id, u.name, u.avatar 
         FROM users u
         JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
         WHERE u.role = 'customer'`,
      );

      const contacts = [];
      for (const c of customers) {
        const [lastMsg] = await db.query(
          `SELECT sender_id, content, created_at FROM messages 
           WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
           ORDER BY created_at DESC LIMIT 1`,
          [c.id, userId, userId, c.id],
        );

        const [unread] = await db.query(
          `SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
          [c.id, userId],
        );

        if (lastMsg.length > 0) {
          contacts.push({
            id: c.id,
            name: c.name,
            avatar: c.avatar || "https://placehold.co/100",
            last_message: lastMsg[0].content,
            last_sender_id: lastMsg[0].sender_id,
            last_time: lastMsg[0].created_at, // Dùng để sắp xếp
            is_online: false,
            unread: unread[0].count || 0,
          });
        }
      }

      // Sắp xếp người vừa nhắn tin lên trên cùng
      contacts.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
      return contacts;
    }
  },
};

module.exports = ChatModel;
