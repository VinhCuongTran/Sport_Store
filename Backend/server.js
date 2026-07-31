// ĐỌC BIẾN MÔI TRƯỜNG ĐẦU TIÊN ĐỂ FIX LỖI MYSQL
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const ChatModel = require("./app/models/chat.model"); // Import ChatModel để sử dụng hàm sendRealTimeNotification
const db = require("./app/utils/mysql.db");

// 1. KHỞI TẠO BIẾN VÀ EXPORT HÀM TRƯỚC (Để tránh lỗi Circular Dependency)
const onlineUsers = new Map();
let io; // Khai báo io trước, sẽ gán giá trị sau

const sendRealTimeNotification = (userId, notificationData) => {
  if (onlineUsers.has(userId) && io) {
    onlineUsers.get(userId).forEach((socketId) => {
      io.to(socketId).emit("new_notification", notificationData);
    });
  }
};

// Export ngay lập tức để controller có thể require được
module.exports = { sendRealTimeNotification };

// 2. SAU ĐÓ MỚI REQUIRE APP (Vì app sẽ gọi đến controller, controller gọi lại hàm export ở trên)
const app = require("./app");
const config = require("./app/config");

// Khởi tạo Server
const server = http.createServer(app);

// Cấu hình Socket.io
io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn (bao gồm cả các thiết bị truy cập qua IP LAN) kết nối vào
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user_connected", (userId) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.userId = userId;

    // --- BỔ SUNG ĐOẠN NÀY VÀO ---
    // Báo cho user vừa vào trang biết những ai đang online
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit("initial_online_users", onlineIds);
    // ----------------------------

    // Báo cho mọi người user này đang online
    io.emit("user_status", { userId, status: "online" });
  });

  // NHẬN VÀ LƯU TIN NHẮN
  socket.on("send_message", async (data) => {
    try {
      let actualReceiverId = data.receiver_id;

      // 1. Xử lý ID ảo 'admin_group' từ Frontend của Khách hàng
      if (data.receiver_id === "admin_group") {
        const [admins] = await db.query(
          "SELECT id FROM users WHERE role IN ('admin', 'staff') LIMIT 1",
        );
        actualReceiverId = admins.length > 0 ? admins[0].id : 1;
      }

      // 2. Lưu xuống MySQL
      const savedMessage = await ChatModel.saveMessage({
        sender_id: data.sender_id,
        receiver_id: actualReceiverId,
        order_id: data.order_id,
        product_id: data.product_id,
        content: data.content,
      });

      const messageToEmit = {
        ...savedMessage,
        time: new Date().toLocaleTimeString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // 3. Phân luồng gửi tin nhắn bằng Socket
      const [adminUsers] = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'staff')",
      );
      const adminIds = adminUsers.map((a) => String(a.id));

      if (adminIds.includes(String(data.sender_id))) {
        // TRƯỜNG HỢP A: Người gửi là Admin/Staff
        // -> Gửi đích danh cho khách hàng
        if (onlineUsers.has(String(actualReceiverId))) {
          onlineUsers.get(String(actualReceiverId)).forEach((socketId) => {
            io.to(socketId).emit("receive_message", messageToEmit);
          });
        }
        // -> Đồng bộ tin nhắn cho các Admin/Staff KHÁC đang mở tab
        adminIds.forEach((adminId) => {
          if (adminId !== String(data.sender_id) && onlineUsers.has(adminId)) {
            onlineUsers.get(adminId).forEach((socketId) => {
              io.to(socketId).emit("receive_message", messageToEmit);
            });
          }
        });
      } else {
        // TRƯỜNG HỢP B: Người gửi là Khách Hàng
        // -> Phát tin nhắn này đến TẤT CẢ Admin/Staff đang online
        adminIds.forEach((adminId) => {
          if (onlineUsers.has(adminId)) {
            onlineUsers.get(adminId).forEach((socketId) => {
              io.to(socketId).emit("receive_message", messageToEmit);
            });
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn Socket:", error);
    }
  });

  // LẮNG NGHE SỰ KIỆN "ĐÃ ĐỌC TIN NHẮN"
  socket.on("mark_read", async (data) => {
    try {
      // data: { sender_id, receiver_id }
      // 1. Cập nhật dữ liệu trên MySQL thành đã đọc (is_read = 1)
      await ChatModel.markAsRead(data.sender_id, data.receiver_id);

      // 2. Báo lại cho thiết bị của người gửi (nếu họ đang online) để lên 2 tick xanh
      if (onlineUsers.has(data.sender_id)) {
        onlineUsers.get(data.sender_id).forEach((socketId) => {
          // Báo cho người gửi (sender) biết là người nhận (reader) vừa xem tin
          io.to(socketId).emit("messages_read", {
            reader_id: data.receiver_id,
          });
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đã đọc:", error);
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        io.emit("user_status", { userId, status: "offline" });
      }
    }
  });
});

// 3. CHẠY SERVER
const PORT = config.app.port || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
