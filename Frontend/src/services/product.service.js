import api from "./api.service";

class ProductService {
  async getAll() {
    return (await api.get("/products")).data;
  }

  async get(id) {
    return (await api.get(`/products/${id}`)).data;
  }

  async create(data) {
    // Dùng cho Create vì có upload file ảnh (FormData)
    return (
      await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async update(id, data) {
    // Cập nhật thông tin và biến thể bằng JSON thông thường
    return (await api.put(`/products/${id}`, data)).data;
  }

  async delete(id) {
    return (await api.delete(`/products/${id}`)).data;
  }
}

export default new ProductService();
