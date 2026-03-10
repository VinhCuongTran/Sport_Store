import api from "./api.service";

class SportService {
  async getAll() {
    return (await api.get("/sports")).data;
  }

  async get(id) {
    return (await api.get(`/sports/${id}`)).data;
  }

  async create(data) {
    return (await api.post("/sports", data)).data;
  }

  async update(id, data) {
    return (await api.put(`/sports/${id}`, data)).data;
  }

  async delete(id) {
    return (await api.delete(`/sports/${id}`)).data;
  }
}

export default new SportService();
