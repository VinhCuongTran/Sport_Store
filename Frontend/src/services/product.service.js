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
}

export default new ProductService();
