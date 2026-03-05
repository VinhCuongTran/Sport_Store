import api from "./api.service";

class BrandService {
  async getAll() {
    return (await api.get("/brands")).data;
  }

  async get(id) {
    return (await api.get(`/brands/${id}`)).data;
  }

  async create(data) {
    // data ở đây là một đối tượng FormData
    return (
      await api.post("/brands", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async update(id, data) {
    // data ở đây là một đối tượng FormData
    return (
      await api.put(`/brands/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async delete(id) {
    return (await api.delete(`/brands/${id}`)).data;
  }
}

export default new BrandService();
