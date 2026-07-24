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
      data.product_id || null,
      data.content,
    ];
    await db.query(query, values);

    // Lấy lại tin nhắn kèm thông tin sản phẩm để trả về Socket
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

  getConversation: async (userId, role, partnerId) => {
    let query = "";
    let params = [];

    if (role === "customer" || partnerId === "admin_group") {
      // Lấy TẤT CẢ tin nhắn của khách hàng này (Bỏ qua việc nhân viên nào là người gửi)
      query = `SELECT m.*, p.name AS product_name, 
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) AS product_image
               FROM messages m
               LEFT JOIN products p ON m.product_id = p.id
               WHERE m.sender_id = ? OR m.receiver_id = ?
               ORDER BY m.created_at ASC`;
      params = [userId, userId];
    } else {
      // DÀNH CHO ADMIN/STAFF: Lấy TẤT CẢ tin nhắn liên quan đến khách hàng cụ thể này (partnerId)
      query = `SELECT m.*, p.name AS product_name, 
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) AS product_image
               FROM messages m
               LEFT JOIN products p ON m.product_id = p.id
               WHERE m.sender_id = ? OR m.receiver_id = ?
               ORDER BY m.created_at ASC`;
      params = [partnerId, partnerId];
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  markAsRead: async (senderId, receiverId) => {
    // Admin đánh dấu đọc các tin nhắn do Khách hàng (senderId) gửi
    // Loại bỏ receiverId trong câu lệnh SQL để Admin nào click vào cũng xóa được thông báo chưa đọc
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND is_read = 0`,
      [senderId],
    );
  },

  markAsReadForCustomer: async (customerId) => {
    // Khách hàng đánh dấu đọc các tin nhắn do hệ thống/Admin gửi đến họ
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`,
      [customerId],
    );
  },

  getContacts: async (userId, role) => {
    if (role === "customer") {
      const [admins] = await db.query(
        `SELECT id, name, avatar FROM users WHERE role IN ('admin', 'staff') LIMIT 1`,
      );
      if (admins.length === 0) return [];
      const admin = admins[0];

      // Lấy tin nhắn cuối cùng của khách hàng
      const [lastMsg] = await db.query(
        `SELECT sender_id, content FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [userId, userId],
      );

      // Đếm số tin chưa đọc dành cho khách hàng này
      const [unread] = await db.query(
        `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`,
        [userId],
      );

      return [
        {
          id: admin.id,
          name: "CSKH - Sport Store",
          avatar: "https://placehold.co/100?text=CSKH",
          last_message:
            lastMsg.length > 0 ? lastMsg[0].content : "Sẵn sàng hỗ trợ bạn!",
          last_sender_id: lastMsg.length > 0 ? lastMsg[0].sender_id : null,
          is_online: false,
          unread: unread[0].count || 0,
        },
      ];
    } else {
      // DÀNH CHO ADMIN: Load danh sách khách hàng đã từng chat
      const [customers] = await db.query(
        `SELECT DISTINCT u.id, u.name, u.avatar
         FROM users u
         JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
         WHERE u.role = 'customer'`,
      );

      const contacts = [];
      for (const c of customers) {
        // Lấy tin nhắn cuối cùng giữa hệ thống và khách hàng này
        const [lastMsg] = await db.query(
          `SELECT sender_id, content, created_at FROM messages
           WHERE sender_id = ? OR receiver_id = ?
           ORDER BY created_at DESC LIMIT 1`,
          [c.id, c.id],
        );

        // Đếm số tin nhắn Khách hàng này gửi mà chưa ai đọc
        const [unread] = await db.query(
          `SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND is_read = 0`,
          [c.id],
        );

        if (lastMsg.length > 0) {
          contacts.push({
            id: c.id,
            name: c.name,
            avatar: c.avatar || "https://placehold.co/100",
            last_message: lastMsg[0].content,
            last_sender_id: lastMsg[0].sender_id,
            last_time: lastMsg[0].created_at,
            is_online: false,
            unread: unread[0].count || 0,
          });
        }
      }

      // Sắp xếp người nhắn gần nhất lên đầu
      contacts.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
      return contacts;
    }
  },
};

module.exports = ChatModel;
