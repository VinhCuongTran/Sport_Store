import api from "./api.service";

class OrderService {
  async getAll() {
    return (await api.get("/orders")).data;
  }
  async get(id) {
    return (await api.get(`/orders/${id}`)).data;
  }
  async updateStatus(id, data) {
    return (await api.put(`/orders/${id}/status`, data)).data;
  }
  // Dành cho Client sau này
  async getByUser(userId) {
    return (await api.get(`/orders/user/${userId}`)).data;
  }
  async create(data) {
    return (await api.post("/orders", data)).data;
  }
}

export default new OrderService();
