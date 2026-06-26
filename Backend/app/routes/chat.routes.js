const express = require("express");
const ChatController = require("../controllers/chat.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// THÊM ROUTE NÀY VÀO TRƯỚC:
router.get("/contacts", verifyToken, ChatController.getContacts);

// Route cũ giữ nguyên:
router.get("/:partnerId", verifyToken, ChatController.getConversation);

module.exports = router;
