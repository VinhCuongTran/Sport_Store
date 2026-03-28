import api from "./api.service";

class VoucherService {
  async getAll() {
    return (await api.get("/vouchers")).data;
  }

  async get(id) {
    return (await api.get(`/vouchers/${id}`)).data;
  }

  async create(data) {
    return (await api.post("/vouchers", data)).data;
  }

  async update(id, data) {
    return (await api.put(`/vouchers/${id}`, data)).data;
  }

  async delete(id) {
    return (await api.delete(`/vouchers/${id}`)).data;
  }
}

export default new VoucherService();
