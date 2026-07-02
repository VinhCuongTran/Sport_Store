const db = require("../utils/mysql.db");
const asyncHandler = require("../utils/async.handler");
const ApiError = require("../utils/api.error");
const { getImageEmbedding } = require("../utils/embedding.util");
const { cosineSimilarity } = require("../utils/vector.util");

const SIMILARITY_THRESHOLD = 0.75;
const MAX_RESULTS = 10;

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

      // Nếu sản phẩm chưa có trong Map, hoặc ảnh này giống hơn ảnh trước đó của cùng sản phẩm
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

    console.log(
      "[search debug] Tổng số ảnh có embedding:",
      images.length,
      "| Tổng số sản phẩm distinct:",
      bestMatchByProduct.size,
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

    // 4. Lấy đầy đủ thông tin sản phẩm (Không cần subquery thumbnail nữa vì đã có matched_image)
    const matchedIds = scored.map((m) => m.product_id);
    const placeholders = matchedIds.map(() => "?").join(",");
    const [products] = await db.query(
      `SELECT p.id, p.name,
          (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as min_price
       FROM products p
       WHERE p.id IN (${placeholders})`,
      matchedIds,
    );

    // Ghép matched_image vào kết quả trả về và sắp xếp lại theo điểm số cao nhất
    const finalProducts = products.map((p) => {
      const matchData = scored.find((s) => s.product_id === p.id);
      return {
        ...p,
        matched_image: matchData ? matchData.matched_image : null,
      };
    });

    const orderIndex = new Map(matchedIds.map((id, idx) => [id, idx]));
    finalProducts.sort((a, b) => orderIndex.get(a.id) - orderIndex.get(b.id));

    res.json({ success: true, products: finalProducts });
  }),
};

module.exports = SearchController;
