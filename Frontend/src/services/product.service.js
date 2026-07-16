import api from "./api.service";

class ProductService {
  async getAll() {
    return (await api.get("/products")).data;
  }

  async get(id) {
    return (await api.get(`/products/${id}`)).data;
  }

  async create(data) {
    return (
      await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async update(id, data) {
    const isFormData = data instanceof FormData;
    return (
      await api.put(`/products/${id}`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      })
    ).data;
  }

  async delete(id) {
    return (await api.delete(`/products/${id}`)).data;
  }

  // Thêm/Bỏ yêu thích
  async toggleFavorite(data) {
    // data có dạng { product_id: "...", variant_id: "..." }
    const response = await api.post("/products/favorite/toggle", data);
    return response.data;
  }

  // Lấy danh sách sản phẩm yêu thích của user đang đăng nhập
  async getFavoriteProducts() {
    const response = await api.get("/products/favorite/list");
    return response.data;
  }
}

export default new ProductService();
