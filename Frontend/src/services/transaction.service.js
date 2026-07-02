import api from "./api.service";

class TransactionService {
  async getAll() {
    const response = await api.get("/transactions");
    return response.data;
  }
}

export default new TransactionService();