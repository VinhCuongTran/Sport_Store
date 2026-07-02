// utils/vector.util.js
// Các hàm toán học đơn giản để so sánh vector (embedding)

/**
 * Tính độ tương đồng cosine giữa 2 vector cùng chiều.
 * Kết quả nằm trong khoảng [-1, 1], càng gần 1 càng giống nhau.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return -1;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { cosineSimilarity };