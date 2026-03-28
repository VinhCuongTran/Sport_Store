const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../utils/mysql.db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function generateWithRetry(prompt, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err.status !== 429) throw err;

      const retryDelay = err.errorDetails?.find((d) =>
        d["@type"]?.includes("RetryInfo"),
      )?.retryDelay;
      const delaySec = retryDelay ? parseInt(retryDelay) : 0;
      const isDaily =
        delaySec === 0 ||
        JSON.stringify(err.errorDetails || {}).includes("PerDay");
      if (isDaily) throw new Error("QUOTA_DAILY_EXCEEDED");

      // Rate limit theo phut: co the retry
      if (i < retries) {
        console.warn(
          "Rate limit (per minute). Retrying in " + delaySec + "s...",
        );
        await new Promise((r) => setTimeout(r, delaySec * 1000));
      } else {
        throw err;
      }
    }
  }
}

// PHÂN LOẠI Ý ĐỊNH (Intent Router)
async function classifyIntent(userMessage) {
  const prompt = `
Bạn là hệ thống phân tích ý định cho một cửa hàng thể thao.
Hãy đọc câu sau: "${userMessage}"

Phân loại vào 1 trong các nhóm và trả về ĐÚNG JSON (không markdown):

1. "TÌM_SẢN_PHẨM": Tìm kiếm, hỏi về sản phẩm thể thao theo tên/loại/môn.
2. "LỌC_SẢN_PHẨM": Hỏi sản phẩm kèm điều kiện lọc như giá, màu sắc, size, thương hiệu.
3. "CHI_TIẾT_SẢN_PHẨM": Hỏi chi tiết về một sản phẩm cụ thể (mô tả, size, màu, giá).
4. "KHUYẾN_MÃI": Hỏi về giảm giá, sale, voucher, mã giảm giá.
5. "CHÀO_HỎI": Chỉ chào hỏi cơ bản.
6. "NGOÀI_LỀ": Không liên quan đến thể thao/mua sắm.

Định dạng trả về:
{
  "intent": "TÊN_NHÓM",
  "keywords": "từ khóa sản phẩm chính (ví dụ: giày chạy bộ, vợt cầu lông)",
  "filters": {
    "max_price": <số hoặc null>,
    "min_price": <số hoặc null>,
    "color": "<màu viết HOA hoặc null>",
    "size": "<size viết HOA hoặc null>",
    "brand": "<tên thương hiệu hoặc null>",
    "sport": "<tên môn thể thao hoặc null>"
  }
}
`;

  const raw = (await generateWithRetry(prompt))
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(raw);
}

// CÁC HÀM TRUY VẤN DATABASE

// Tìm sản phẩm theo từ khóa tên/mô tả, có thể kết hợp bộ lọc thêm.
async function searchProducts(keywords, filters = {}) {
  const conditions = [
    "(p.name LIKE ? OR p.description LIKE ? OR s.name LIKE ? OR c.name LIKE ?)",
  ];
  const params = [
    `%${keywords}%`,
    `%${keywords}%`,
    `%${keywords}%`,
    `%${keywords}%`,
  ];

  if (filters.max_price) {
    conditions.push(
      "(SELECT MIN(price) FROM product_variants WHERE product_id = p.id) <= ?",
    );
    params.push(filters.max_price);
  }
  if (filters.min_price) {
    conditions.push(
      "(SELECT MIN(price) FROM product_variants WHERE product_id = p.id) >= ?",
    );
    params.push(filters.min_price);
  }
  if (filters.color) {
    conditions.push(
      "EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id AND UPPER(color) = ?)",
    );
    params.push(filters.color.toUpperCase());
  }
  if (filters.size) {
    conditions.push(
      "EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id AND UPPER(size) = ?)",
    );
    params.push(filters.size.toUpperCase());
  }
  if (filters.brand) {
    conditions.push("b.name LIKE ?");
    params.push(`%${filters.brand}%`);
  }
  if (filters.sport) {
    conditions.push("s.name LIKE ?");
    params.push(`%${filters.sport}%`);
  }

  const whereClause = conditions.join(" AND ");

  const [products] = await db.query(
    `SELECT 
        p.id, p.name, p.description,
        b.name AS brand_name,
        c.name AS category_name,
        s.name AS sport_name,
        (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) AS min_price,
        (SELECT MAX(price) FROM product_variants WHERE product_id = p.id) AS max_price,
        CASE
          WHEN p.discount_percent > 0
            AND (p.sale_start IS NULL OR p.sale_start <= NOW())
            AND (p.sale_end IS NULL OR p.sale_end >= NOW())
          THEN p.discount_percent ELSE 0
        END AS active_discount,
        (SELECT GROUP_CONCAT(DISTINCT UPPER(color) ORDER BY color SEPARATOR ', ')
         FROM product_variants WHERE product_id = p.id AND color IS NOT NULL) AS colors,
        (SELECT GROUP_CONCAT(DISTINCT UPPER(size) ORDER BY size SEPARATOR ', ')
         FROM product_variants WHERE product_id = p.id AND size IS NOT NULL) AS sizes,
        (SELECT image_url FROM product_images 
         WHERE product_id = p.id AND is_thumbnail = 1 LIMIT 1) AS thumbnail
     FROM products p
     LEFT JOIN brands b ON p.brand_id = b.id
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN sports s ON c.sport_id = s.id
     WHERE p.status = 'active' AND ${whereClause}
     LIMIT 5`,
    params,
  );

  return products;
}

// Lấy các voucher đang active.
async function getActiveVouchers() {
  const [vouchers] = await db.query(
    `SELECT code, discount_type, discount_value, min_order_value, max_discount, end_date
     FROM vouchers
     WHERE start_date <= NOW()
       AND end_date >= NOW()
       AND (usage_limit IS NULL OR used_count < usage_limit)
     ORDER BY discount_value DESC
     LIMIT 5`,
  );
  return vouchers;
}

// Lấy các sản phẩm đang có chương trình giảm giá.
async function getSaleProducts() {
  const [products] = await db.query(
    `SELECT p.name, p.discount_percent, p.sale_end,
        (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) AS min_price,
        b.name AS brand_name,
        s.name AS sport_name
     FROM products p
     LEFT JOIN brands b ON p.brand_id = b.id
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN sports s ON c.sport_id = s.id
     WHERE p.status = 'active'
       AND p.discount_percent > 0
       AND (p.sale_start IS NULL OR p.sale_start <= NOW())
       AND (p.sale_end IS NULL OR p.sale_end >= NOW())
     ORDER BY p.discount_percent DESC
     LIMIT 5`,
  );
  return products;
}

// DỰNG NỘI DUNG CONTEXT CHO AI

function buildProductContext(products) {
  return products
    .map((p) => {
      const priceRange =
        p.min_price === p.max_price
          ? `${Number(p.min_price).toLocaleString("vi-VN")} VNĐ`
          : `${Number(p.min_price).toLocaleString("vi-VN")} – ${Number(p.max_price).toLocaleString("vi-VN")} VNĐ`;

      const discountNote =
        p.active_discount > 0 ? ` (Đang giảm ${p.active_discount}%)` : "";
      const brandNote = p.brand_name ? ` | Thương hiệu: ${p.brand_name}` : "";
      const colorNote = p.colors ? ` | Màu: ${p.colors}` : "";
      const sizeNote = p.sizes ? ` | Size: ${p.sizes}` : "";
      const sportNote = p.sport_name ? ` | Môn: ${p.sport_name}` : "";

      return `• ${p.name}${brandNote}${sportNote} — Giá: ${priceRange}${discountNote}${colorNote}${sizeNote}. Mô tả: ${p.description}`;
    })
    .join("\n");
}

function buildVoucherContext(vouchers) {
  return vouchers
    .map((v) => {
      const discountText =
        v.discount_type === "percent"
          ? `Giảm ${v.discount_value}%`
          : `Giảm ${Number(v.discount_value).toLocaleString("vi-VN")} VNĐ`;
      const minOrder = v.min_order_value
        ? ` (đơn từ ${Number(v.min_order_value).toLocaleString("vi-VN")} VNĐ)`
        : "";
      const maxDiscount =
        v.max_discount && v.discount_type === "percent"
          ? `, tối đa ${Number(v.max_discount).toLocaleString("vi-VN")} VNĐ`
          : "";
      const expiry = v.end_date
        ? ` — HSD: ${new Date(v.end_date).toLocaleDateString("vi-VN")}`
        : "";
      return `• Mã: ${v.code} — ${discountText}${minOrder}${maxDiscount}${expiry}`;
    })
    .join("\n");
}

function buildSaleContext(products) {
  return products
    .map((p) => {
      const expiry = p.sale_end
        ? ` (sale đến ${new Date(p.sale_end).toLocaleDateString("vi-VN")})`
        : "";
      const price = p.min_price
        ? ` — Từ ${Number(p.min_price).toLocaleString("vi-VN")} VNĐ`
        : "";
      return `• ${p.name}${price} — Giảm ${p.discount_percent}%${expiry}`;
    })
    .join("\n");
}

// HANDLER CHÍNH
exports.handleChat = async (req, res, next) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) {
      return res.status(400).json({ reply: "Bạn chưa nhập tin nhắn." });
    }

    // Phân loại ý định
    const { intent, keywords, filters } = await classifyIntent(userMessage);

    // Xử lý theo ý định
    if (intent === "NGOÀI_LỀ") {
      return res.json({
        reply:
          "Xin lỗi, mình là trợ lý của cửa hàng thể thao và chỉ hỗ trợ tư vấn về sản phẩm & dụng cụ thể thao thôi ạ. Bạn cần tìm loại sản phẩm nào không? 😊",
      });
    }

    if (intent === "CHÀO_HỎI") {
      return res.json({
        reply:
          "Xin chào! 👋 Chào mừng bạn đến với cửa hàng thể thao của chúng mình. Hôm nay mình có thể tư vấn dụng cụ thể thao gì cho bạn nào?",
      });
    }

    if (intent === "KHUYẾN_MÃI") {
      const [vouchers, saleProducts] = await Promise.all([
        getActiveVouchers(),
        getSaleProducts(),
      ]);

      const hasVouchers = vouchers.length > 0;
      const hasSaleProducts = saleProducts.length > 0;

      if (!hasVouchers && !hasSaleProducts) {
        return res.json({
          reply:
            "Hiện tại cửa hàng chưa có chương trình khuyến mãi nào đang chạy. Bạn để lại thông tin để mình thông báo khi có deal mới nhé! 😊",
        });
      }

      let contextBlock = "";
      if (hasSaleProducts) {
        contextBlock += `Sản phẩm đang giảm giá:\n${buildSaleContext(saleProducts)}\n\n`;
      }
      if (hasVouchers) {
        contextBlock += `Mã voucher hiện có:\n${buildVoucherContext(vouchers)}`;
      }

      const prompt = `
Bạn là nhân viên tư vấn nhiệt tình của cửa hàng thể thao.
Người dùng hỏi: "${userMessage}"

Thông tin khuyến mãi hiện tại:
${contextBlock}

Hãy trả lời đầy đủ và hấp dẫn bằng tiếng Việt:
- Giới thiệu tổng quan về chương trình đang có.
- Liệt kê rõ từng sản phẩm đang giảm giá (nếu có): tên, % giảm, giá gốc, thời hạn sale.
- Liệt kê rõ từng mã voucher (nếu có): mã code, mức giảm, điều kiện áp dụng, hạn sử dụng.
- Hướng dẫn cách dùng mã voucher khi thanh toán.
- Kết thúc bằng lời khuyến khích mua sắm thân thiện.
Viết ít nhất 5-7 câu, có thể dùng emoji. KHÔNG viết quá ngắn gọn.
`;
      const replyText = await generateWithRetry(prompt);
      return res.json({ reply: replyText });
    }

    // Với TÌM_SẢN_PHẨM, LỌC_SẢN_PHẨM, CHI_TIẾT_SẢN_PHẨM — đều tìm DB
    if (
      intent === "TÌM_SẢN_PHẨM" ||
      intent === "LỌC_SẢN_PHẨM" ||
      intent === "CHI_TIẾT_SẢN_PHẨM"
    ) {
      if (!keywords || keywords.trim() === "") {
        return res.json({
          reply:
            "Bạn muốn tìm loại sản phẩm nào ạ? Ví dụ: giày chạy bộ, vợt cầu lông, áo thể thao... Mình sẽ tư vấn ngay!",
        });
      }

      const products = await searchProducts(keywords, filters || {});

      if (products.length === 0) {
        return res.json({
          reply: `Dạ hiện tại bên mình chưa có sản phẩm nào phù hợp với yêu cầu "${keywords}"${
            filters?.max_price
              ? ` dưới ${Number(filters.max_price).toLocaleString("vi-VN")} VNĐ`
              : ""
          }. Bạn có muốn thử tìm theo tiêu chí khác hoặc xem các sản phẩm tương tự không ạ? 😊`,
        });
      }

      const productContext = buildProductContext(products);

      const detailInstruction =
        intent === "CHI_TIẾT_SẢN_PHẨM"
          ? `Hãy mô tả chi tiết về sản phẩm phù hợp nhất: công dụng, chất liệu, các size và màu có sẵn, khoảng giá, điểm nổi bật so với các lựa chọn khác. Nếu có nhiều sản phẩm, so sánh và gợi ý sản phẩm phù hợp nhất cho nhu cầu của khách.`
          : `Hãy giới thiệu từng sản phẩm một cách hấp dẫn: nêu tên, điểm nổi bật, phù hợp với đối tượng nào, khoảng giá. Gợi ý sản phẩm tốt nhất và lý do nên chọn. Khuyến khích khách click vào thẻ sản phẩm bên dưới để xem chi tiết.`;

      const prompt = `
Bạn là nhân viên tư vấn nhiệt tình, am hiểu sản phẩm thể thao của cửa hàng.
Người dùng hỏi: "${userMessage}"

Danh sách sản phẩm trong cửa hàng phù hợp với yêu cầu:
${productContext}

${detailInstruction}

Yêu cầu về câu trả lời:
- Viết ít nhất 4-6 câu, đủ thông tin để khách quyết định.
- Với mỗi sản phẩm: nêu tên rõ ràng, 1-2 điểm nổi bật, giá tham khảo.
- Cuối câu trả lời nhắc khách có thể click vào thẻ sản phẩm bên dưới để xem chi tiết và đặt hàng.
- Trả lời bằng tiếng Việt, thân thiện, tự nhiên như nhân viên thật. Có thể dùng emoji phù hợp.
- KHÔNG liệt kê dạng gạch đầu dòng khô khan, hãy viết thành đoạn văn tự nhiên.
`;

      const replyText = await generateWithRetry(prompt);
      return res.json({
        reply: replyText,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          min_price: p.min_price,
          max_price: p.max_price,
          thumbnail: p.thumbnail,
          brand_name: p.brand_name,
          sport_name: p.sport_name,
          active_discount: p.active_discount,
          colors: p.colors,
          sizes: p.sizes,
        })),
      });
    }

    // Fallback nếu intent không khớp
    return res.json({
      reply:
        "Mình chưa hiểu rõ yêu cầu của bạn lắm. Bạn có thể mô tả cụ thể hơn về sản phẩm thể thao bạn đang cần không ạ?",
    });
  } catch (error) {
    if (error.message === "QUOTA_DAILY_EXCEEDED") {
      return res.json({
        reply:
          "Xin lỗi, hệ thống AI của cửa hàng đã đạt giới hạn hôm nay 😔 Bạn vui lòng quay lại vào ngày mai nhé! Hoặc bạn có thể tự tìm sản phẩm tại trang **Sản phẩm** của chúng mình. 🙏",
      });
    }
    console.error("Chatbot Error:", error);
    res.status(500).json({
      reply:
        "Hệ thống đang bận, vui lòng thử lại sau một lát nhé! Xin lỗi bạn vì sự bất tiện này 🙏",
    });
  }
};
