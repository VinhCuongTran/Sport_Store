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

  // API: Thống kê theo Tháng / Quý / Năm bao gồm LỢI NHUẬN
  getFilteredStats: asyncHandler(async (req, res) => {
    const { period, year, month, quarter } = req.query;

    let dateCondition = "1=1";
    const params = [];

    // Xây dựng điều kiện WHERE
    if (period === "month" && year && month) {
      dateCondition = "YEAR(created_at) = ? AND MONTH(created_at) = ?";
      params.push(year, month);
    } else if (period === "quarter" && year && quarter) {
      dateCondition = "YEAR(created_at) = ? AND QUARTER(created_at) = ?";
      params.push(year, quarter);
    } else if (period === "year" && year) {
      dateCondition = "YEAR(created_at) = ?";
      params.push(year);
    } else if (period) {
      return res
        .status(400)
        .json({
          message: "Thiếu tham số thời gian tương ứng (year, month, quarter)",
        });
    }

    const safeDateCondition = dateCondition.replace(
      /created_at/g,
      "o.created_at",
    );

    // 1. Tính Doanh thu & Lợi nhuận
    const [costResult] = await db.query(
      `SELECT SUM(oi.quantity * pv.import_price) as total_cost, SUM(oi.quantity * oi.price) as total_revenue
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE (o.status = 'completed' OR o.payment_status = 'paid') 
       AND ${safeDateCondition}`,
      params,
    );
    const totalCost = costResult[0].total_cost || 0;
    const revenue = costResult[0].total_revenue || 0;
    const profit = revenue - totalCost;

    // 2. Lấy DANH SÁCH đơn Thành Công & Chi tiết người mua, món hàng
    const [successOrderList] = await db.query(
      `SELECT o.id, o.receiver_name, o.phone_number, o.shipping_address, o.total_price, o.created_at, o.status
       FROM orders o
       WHERE (o.status = 'completed' OR o.payment_status = 'paid') 
       AND ${safeDateCondition} ORDER BY o.created_at DESC`,
      params,
    );

    // Lặp qua từng đơn thành công để lấy chi tiết sản phẩm
    for (let order of successOrderList) {
      const [items] = await db.query(
        `
        SELECT oi.quantity, oi.price, p.name as product_name, pv.color, pv.size,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as image_url
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE oi.order_id = ?
      `,
        [order.id],
      );
      order.items = items;
    }

    // 3. Lấy DANH SÁCH đơn Đã Hủy
    const [cancelledOrderList] = await db.query(
      `SELECT o.id, o.receiver_name, o.phone_number, o.shipping_address, o.total_price, o.created_at, o.status
       FROM orders o
       WHERE o.status = 'cancelled' 
       AND ${safeDateCondition} ORDER BY o.created_at DESC`,
      params,
    );

    for (let order of cancelledOrderList) {
      const [items] = await db.query(
        `
        SELECT oi.quantity, oi.price, p.name as product_name, pv.color, pv.size,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as image_url
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE oi.order_id = ?
      `,
        [order.id],
      );
      order.items = items;
    }

    res.json({
      filter: { period, year, month, quarter },
      stats: {
        revenue: Number(revenue),
        profit: Number(profit),
        totalCost: Number(totalCost),
        successOrders: successOrderList.length,
        cancelledOrders: cancelledOrderList.length,
      },
      // Trả về thêm 2 mảng này để Frontend vẽ UI
      successOrderList,
      cancelledOrderList,
    });
  }),
};

module.exports = StatsController;
