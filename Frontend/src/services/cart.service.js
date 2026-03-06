// src/services/cart.service.js
import api from "./api.service";

class CartService {
  async getCart(userId) {
    return (await api.get(`/carts/${userId}`)).data;
  }

  async addToCart(data) {
    return (await api.post("/carts/add", data)).data;
  }

  async updateQuantity(itemId, quantity) {
    return (await api.put(`/carts/item/${itemId}`, { quantity })).data;
  }

  async removeItem(itemId) {
    return (await api.delete(`/carts/item/${itemId}`)).data;
  }

  async clearCart(userId) {
    return (await api.delete(`/carts/clear/${userId}`)).data;
  }
}

export default new CartService();
