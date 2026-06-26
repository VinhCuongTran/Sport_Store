import api from "./api.service";

class NotificationService {
  constructor(baseUrl = "/notifications") {
    // Lưu lại cái base URL của service này thay vì khởi tạo instance mới
    this.baseUrl = baseUrl;
  }

  async getAll() {
    // Sử dụng instance 'api' đã import để gọi request
    return (await api.get(this.baseUrl)).data;
  }

  async markAsRead(id) {
    return (await api.put(`${this.baseUrl}/${id}/read`)).data;
  }
}

export default new NotificationService();
