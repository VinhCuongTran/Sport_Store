import api from "./api.service";

class ReviewService {
  async getAll() {
    return (await api.get("/reviews")).data;
  }

  async delete(id) {
    return (await api.delete(`/reviews/${id}`)).data;
  }

  async getByProduct(productId) {
    return (await api.get(`/reviews/product/${productId}`)).data;
  }

  async create(data) {
    return (await api.post("/reviews", data)).data;
  }
}

export default new ReviewService();
