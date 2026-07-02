// utils/embedding.util.js
// Vector hoá hình ảnh bằng CLIP (chạy local qua @xenova/transformers).
// Không cần API key ngoài, không cần GCP. Model tải về máy 1 lần và cache lại
// trong node_modules/.cache (hoặc theo TRANSFORMERS_CACHE nếu bạn set).
//
// Cài đặt: npm install @xenova/transformers

const MODEL_ID = "Xenova/clip-vit-base-patch32";

let _processor = null;
let _visionModel = null;
let _loadingPromise = null;

// @xenova/transformers là ESM-only -> phải dùng dynamic import kể cả trong file CommonJS
async function loadModel() {
  if (_processor && _visionModel) return;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    const { AutoProcessor, CLIPVisionModelWithProjection } =
      await import("@xenova/transformers");
    console.log("[embedding] Đang tải model CLIP (chỉ tải lần đầu)...");
    _processor = await AutoProcessor.from_pretrained(MODEL_ID);
    _visionModel = await CLIPVisionModelWithProjection.from_pretrained(
      MODEL_ID,
      { quantized: true }, // bản quantized nhẹ hơn, đủ chính xác cho use-case này
    );
    console.log("[embedding] Model CLIP đã sẵn sàng.");
  })();

  return _loadingPromise;
}

/**
 * Vector hoá 1 buffer ảnh (Buffer) thành mảng số (embedding).
 * @param {Buffer} buffer - dữ liệu ảnh gốc (từ multer, hoặc tải từ URL)
 * @returns {Promise<number[]>}
 */
async function getImageEmbedding(buffer) {
  await loadModel();
  const { RawImage } = await import("@xenova/transformers");

  const image = await RawImage.fromBlob(new Blob([buffer]));
  const imageInputs = await _processor(image);
  const { image_embeds } = await _visionModel(imageInputs);

  // image_embeds là 1 tensor [1, 512] -> lấy mảng float thuần
  return Array.from(image_embeds.data);
}

/**
 * Vector hoá 1 ảnh từ URL (vd: ảnh đã upload lên Cloudinary).
 * Dùng khi bạn không có sẵn buffer trong tay (như khi dùng CloudinaryStorage).
 * @param {string} url
 * @returns {Promise<number[]>}
 */
async function getImageEmbeddingFromUrl(url) {
  const axios = require("axios");
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  return getImageEmbedding(buffer);
}

module.exports = { getImageEmbedding, getImageEmbeddingFromUrl };
