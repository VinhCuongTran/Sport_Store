const db = require("../utils/mysql.db");
const asyncHandler = require("../utils/async.handler");
const ApiError = require("../utils/api.error");
const { getImageEmbedding } = require("../utils/embedding.util");
const { cosineSimilarity } = require("../utils/vector.util");

const SIMILARITY_THRESHOLD = 0.75; // Giữ nguyên ngưỡng của bạn
const MAX_RESULTS = 20; // Tăng lên 20 để hiển thị nhiều kết quả hơn (bạn đang để 10)

const SearchController = {
  searchByImage: asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Vui lòng tải lên một hình ảnh.");

    // 1. Vector hoá ảnh khách gửi lên
    const queryEmbedding = await getImageEmbedding(req.file.buffer);

    // 2. Lấy vector và KÈM THEO image_url của TẤT CẢ ảnh
    const [images] = await db.query(
      `SELECT pi.product_id, pi.image_url, pi.embedding
       FROM product_images pi
       JOIN products p ON p.id = pi.product_id
       WHERE p.status = 'active'
         AND pi.embedding IS NOT NULL`,
    );

    if (images.length === 0) {
      throw new ApiError(
        404,
        "Hệ thống chưa có dữ liệu hình ảnh để so sánh. Vui lòng thử lại sau.",
      );
    }

    // 3. So sánh cosine similarity và giữ lại url của ảnh giống nhất
    const bestMatchByProduct = new Map();

    for (const img of images) {
      let vec = img.embedding;
      if (typeof vec === "string") {
        try {
          vec = JSON.parse(vec);
        } catch {
          continue;
        }
      }
      if (!Array.isArray(vec)) continue;

      const score = cosineSimilarity(queryEmbedding, vec);
      const current = bestMatchByProduct.get(img.product_id);

      if (current === undefined || score > current.score) {
        bestMatchByProduct.set(img.product_id, {
          score: score,
          matched_image: img.image_url,
        });
      }
    }

    const scoredAll = Array.from(bestMatchByProduct.entries())
      .map(([product_id, data]) => ({
        product_id,
        score: data.score,
        matched_image: data.matched_image,
      }))
      .sort((a, b) => b.score - a.score);

    const scored = scoredAll
      .filter((s) => s.score >= SIMILARITY_THRESHOLD)
      .slice(0, MAX_RESULTS);

    if (scored.length === 0) {
      throw new ApiError(
        404,
        "Không tìm thấy sản phẩm nào có vẻ ngoài tương tự.",
      );
    }

    // 4. Lấy ĐẦY ĐỦ thông tin sản phẩm (Giống hệt API Get Products)
    const matchedIds = scored.map((m) => m.product_id);
    const placeholders = matchedIds.map(() => "?").join(",");

    const [products] = await db.query(
      `SELECT 
          p.*,
          c.name as category_name,
          b.name as brand_name,
          (
              SELECT JSON_ARRAYAGG(pi.image_url)
              FROM product_images pi
              WHERE pi.product_id = p.id
          ) as images,
          (
              SELECT MIN(price)
              FROM product_variants
              WHERE product_id = p.id
          ) as min_price,
          (
              SELECT SUM(quantity)
              FROM order_items oi
              JOIN orders o ON oi.order_id = o.id
              WHERE oi.product_id = p.id AND o.status = 'completed'
          ) as sold_count,
          (
              SELECT AVG(rating)
              FROM reviews r
              WHERE r.product_id = p.id
          ) as average_rating,
          (
              SELECT GROUP_CONCAT(DISTINCT color SEPARATOR ',')
              FROM product_variants
              WHERE product_id = p.id
          ) as colors
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id IN (${placeholders})`,
      matchedIds,
    );

    // 5. Ghép matched_image vào kết quả trả về và sắp xếp lại theo điểm số cao nhất AI
    const finalProducts = products.map((p) => {
      const matchData = scored.find((s) => s.product_id === p.id);

      // Xử lý active_discount (nếu đang trong thời gian sale)
      let activeDiscount = 0;
      if (p.discount_percent > 0 && p.sale_start && p.sale_end) {
        const now = new Date();
        const start = new Date(p.sale_start);
        const end = new Date(p.sale_end);
        if (now >= start && now <= end) {
          activeDiscount = p.discount_percent;
        }
      }

      return {
        ...p,
        active_discount: activeDiscount,
        // Ép kiểu số để frontend dễ sort/filter
        min_price: p.min_price ? parseFloat(p.min_price) : 0,
        sold_count: p.sold_count ? parseInt(p.sold_count) : 0,
        average_rating: p.average_rating ? parseFloat(p.average_rating) : 0,
        matched_image: matchData ? matchData.matched_image : null,
      };
    });

    const orderIndex = new Map(matchedIds.map((id, idx) => [id, idx]));
    finalProducts.sort((a, b) => orderIndex.get(a.id) - orderIndex.get(b.id));

    res.json({ success: true, products: finalProducts });
  }),
};

module.exports = SearchController;
