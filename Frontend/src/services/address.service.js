import api from "./api.service";

class AddressService {
  async getAll() {
    return (await api.get("/addresses")).data;
  }
  async create(data) {
    return (await api.post("/addresses", data)).data;
  }
  async update(id, data) {
    return (await api.put(`/addresses/${id}`, data)).data;
  }
  async delete(id) {
    return (await api.delete(`/addresses/${id}`)).data;
  }
  async setDefault(id) {
    return (await api.put(`/addresses/${id}/default`)).data;
  }
}
export default new AddressService();
