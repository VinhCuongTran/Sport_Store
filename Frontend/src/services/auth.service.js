import api from "./api.service";

class AuthService {
  async login(data) {
    return (await api.post("/auth/login", data)).data;
  }

  async sendOtp(data) {
    return (await api.post("/auth/send-otp", data)).data;
  }

  async registerWithOtp(data) {
    return (await api.post("/auth/register-with-otp", data)).data;
  }

  async checkExists(data) {
    return (await api.post("/auth/check-exists", data)).data;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && (user.role === "admin" || user.role === "staff");
  }
}

export default new AuthService();
