import api from "./api.service";

class AuthService {
  async login(data) {
    return (await api.post("/auth/login", data)).data;
  }

  async register(data) {
    return (await api.post("/auth/register", data)).data;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Hàm kiểm tra quyền Admin
  isAdmin() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && (user.role === "admin" || user.role === "staff");
  }
}

export default new AuthService();
