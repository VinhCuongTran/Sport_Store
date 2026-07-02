const db = require("../utils/mysql.db");
const asyncHandler = require("../utils/async.handler");

const TransactionController = {
  getAll: asyncHandler(async (req, res) => {
    // Lấy tất cả dòng tiền, sắp xếp mới nhất lên đầu
    const [rows] = await db.query(
      `SELECT * FROM transactions ORDER BY created_at DESC`
    );
    res.json(rows);
  })
};

module.exports = TransactionController;