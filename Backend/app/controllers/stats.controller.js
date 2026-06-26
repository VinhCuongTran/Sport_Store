const db = require("../utils/mysql.db");
const asyncHandler = require("../utils/async.handler");

const StatsController = {
  getOverview: asyncHandler(async (req, res) => {
    const [revenueResult] = await db.query(
      `SELECT SUM(total_price) as total_revenue 
       FROM orders 
       WHERE status = 'completed' OR payment_status = 'paid'`,
    );
    const revenue = revenueResult[0].total_revenue || 0;

    const [successResult] = await db.query(
      `SELECT COUNT(id) as count 
       FROM orders 
       WHERE status = 'completed'`,
    );
    const successOrders = successResult[0].count || 0;

    const [cancelResult] = await db.query(
      `SELECT COUNT(id) as count 
       FROM orders 
       WHERE status = 'cancelled'`,
    );
    const cancelledOrders = cancelResult[0].count || 0;

    // SỬA ĐOẠN NÀY TRONG getOverview
    const [lowStockResult] = await db.query(
      `SELECT p.id as product_id, p.name as product_name, pv.id as variant_id, pv.size, pv.color, pv.stock 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.id 
       WHERE pv.stock <= 5 
       ORDER BY pv.stock ASC`,
    );

    res.json({
      revenue,
      successOrders,
      cancelledOrders,
      lowStockProducts: lowStockResult,
    });
  }),
  // Lấy Lịch sử Nhập/Xuất Kho
  getInventoryLogs: asyncHandler(async (req, res) => {
    const [logs] = await db.query(`
      SELECT il.*, 
             pv.size, pv.color, 
             p.name AS product_name
      FROM inventory_logs il
      JOIN product_variants pv ON il.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      ORDER BY il.created_at DESC
    `);

    res.json(logs);
  }),
};

module.exports = StatsController;
