// controllers/activity_log.controller.js
const ActivityLog = require("../models/activity_log.model");
const asyncHandler = require("../utils/async.handler");

const ActivityLogController = {
  // Hàm lấy toàn bộ lịch sử thao tác
  getAll: asyncHandler(async (req, res) => {
    const logs = await ActivityLog.getAllLogs();
    res.status(200).json(logs);
  })
};

module.exports = ActivityLogController;