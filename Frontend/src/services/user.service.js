import api from "./api.service";

class UserService {
  async getAll() {
    return (await api.get("/users")).data;
  }
  async get(id) {
    return (await api.get(`/users/${id}`)).data;
  }
  async update(id, data) {
    return (
      await api.put(`/users/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async delete(id) {
    return (await api.delete(`/users/${id}`)).data;
  }
}

export default new UserService();
