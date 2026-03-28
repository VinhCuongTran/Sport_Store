import api from "./api.service";

class CategoryService {
  async getAll() {
    return (await api.get("/categories")).data;
  }

  async get(id) {
    return (await api.get(`/categories/${id}`)).data;
  }

  async create(data) {
    return (await api.post("/categories", data)).data;
  }

  async update(id, data) {
    return (await api.put(`/categories/${id}`, data)).data;
  }

  async delete(id) {
    return (await api.delete(`/categories/${id}`)).data;
  }
}

export default new CategoryService();
