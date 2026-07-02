const db = require("../utils/mysql.db");
const asyncHandler = require("../utils/async.handler");
const ApiError = require("../utils/api.error");
const { getImageEmbedding } = require("../utils/embedding.util");
const { cosineSimilarity } = require("../utils/vector.util");

// Ngưỡng độ giống nhau tối thiểu để coi là "cùng loại sản phẩm".
// Có thể tinh chỉnh dựa trên dữ liệu thực tế (0.7 - 0.85 là khoảng hợp lý với CLIP).
const SIMILARITY_THRESHOLD = 0.75;
const MAX_RESULTS = 10;

const SearchController = {
  searchByImage: asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Vui lòng tải lên một hình ảnh.");

    // 1. Vector hoá ảnh khách gửi lên (chạy local, không tốn phí API)
    const queryEmbedding = await getImageEmbedding(req.file.buffer);

    // 2. Lấy vector của TẤT CẢ ảnh (không chỉ thumbnail) thuộc sản phẩm đang active
    const [images] = await db.query(
      `SELECT pi.product_id, pi.embedding
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

    // 3. So sánh cosine similarity cho từng ảnh, rồi gộp theo sản phẩm
    //    (1 sản phẩm có nhiều ảnh -> lấy điểm CAO NHẤT trong các ảnh của nó)
    const bestScoreByProduct = new Map();

    for (const img of images) {
      let vec = img.embedding;
      // mysql2 tự parse cột kiểu JSON thành mảng JS sẵn -> chỉ parse thêm
      // nếu vì lý do gì đó nó vẫn còn ở dạng chuỗi (phòng hờ, không nên xảy ra).
      if (typeof vec === "string") {
        try {
          vec = JSON.parse(vec);
        } catch {
          continue;
        }
      }
      if (!Array.isArray(vec)) continue;

      const score = cosineSimilarity(queryEmbedding, vec);
      const current = bestScoreByProduct.get(img.product_id);
      if (current === undefined || score > current) {
        bestScoreByProduct.set(img.product_id, score);
      }
    }

    const scoredAll = Array.from(bestScoreByProduct.entries())
      .map(([product_id, score]) => ({ product_id, score }))
      .sort((a, b) => b.score - a.score);

    // --- DEBUG: in ra top 5 điểm số cao nhất tìm được, để chẩn đoán ---
    console.log(
      "[search debug] Tổng số ảnh có embedding:",
      images.length,
      "| Tổng số sản phẩm distinct:",
      bestScoreByProduct.size,
    );
    console.log("[search debug] Top 5 điểm giống nhất:", scoredAll.slice(0, 5));

    const scored = scoredAll
      .filter((s) => s.score >= SIMILARITY_THRESHOLD)
      .slice(0, MAX_RESULTS);

    if (scored.length === 0) {
      throw new ApiError(
        404,
        "Không tìm thấy sản phẩm nào có vẻ ngoài tương tự.",
      );
    }

    // 4. Lấy đầy đủ thông tin sản phẩm để trả về FE
    const matchedIds = scored.map((m) => m.product_id);
    const placeholders = matchedIds.map(() => "?").join(",");
    const [products] = await db.query(
      `SELECT p.id, p.name,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) as thumbnail
       FROM products p
       WHERE p.id IN (${placeholders})`,
      matchedIds,
    );

    // Giữ đúng thứ tự giống nhất -> ít giống nhất theo score đã tính ở bước 3
    const orderIndex = new Map(matchedIds.map((id, idx) => [id, idx]));
    products.sort((a, b) => orderIndex.get(a.id) - orderIndex.get(b.id));

    res.json({ success: true, products });
  }),
};

module.exports = SearchController;
