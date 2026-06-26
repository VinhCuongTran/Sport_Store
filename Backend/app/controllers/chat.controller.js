const ChatModel = require("../models/chat.model");
const asyncHandler = require("../utils/async.handler");

const ChatController = {
  getContacts: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    const contacts = await ChatModel.getContacts(userId, role);
    res.json(contacts);
  }),
  getConversation: asyncHandler(async (req, res) => {
    const userId1 = req.user.id; // ID người đang đăng nhập (Lấy từ middleware xác thực)
    const userId2 = req.params.partnerId; // ID người đang chat cùng

    const messages = await ChatModel.getConversation(userId1, userId2);

    // Format lại dữ liệu thời gian cho giao diện dễ đọc
    const formattedMessages = messages.map((msg) => ({
      ...msg,
      time: new Date(msg.created_at).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Đánh dấu đã đọc nếu mình là người nhận
    await ChatModel.markAsRead(userId2, userId1);

    res.json(formattedMessages);
  }),
};

module.exports = ChatController;
