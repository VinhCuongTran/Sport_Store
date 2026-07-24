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
    const userId = req.user.id;
    const role = req.user.role; // Lấy role từ token
    const partnerId = req.params.partnerId;

    // Truyền role vào để Model biết cách truy vấn theo nhóm
    const messages = await ChatModel.getConversation(userId, role, partnerId);

    // Format lại lưu thời gian cho giao diện
    const formattedMessages = messages.map((msg) => ({
      ...msg,
      time: new Date(msg.created_at).toLocaleTimeString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Phân luồng đánh dấu đã đọc
    if (role === "customer") {
      await ChatModel.markAsReadForCustomer(userId);
    } else {
      await ChatModel.markAsRead(partnerId, userId);
    }

    res.json(formattedMessages);
  }),
};

module.exports = ChatController;
