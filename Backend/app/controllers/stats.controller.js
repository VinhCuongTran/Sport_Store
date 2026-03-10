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

    const [lowStockResult] = await db.query(
      `SELECT p.name as product_name, pv.size, pv.color, pv.stock 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.id 
       WHERE pv.stock < 10 
       ORDER BY pv.stock ASC`,
    );

    res.json({
      revenue,
      successOrders,
      cancelledOrders,
      lowStockProducts: lowStockResult,
    });
  }),
};

module.exports = StatsController;
