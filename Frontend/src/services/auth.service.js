import api from "./api.service";

class AuthService {
  async login(data) {
    return (await api.post("/auth/login", data)).data;
  }

  async checkExists(data) {
    return (await api.post("/auth/check-exists", data)).data;
  }

  async sendOtp(data) {
    return (await api.post("/auth/send-otp", data)).data;
  }

  async registerWithOtp(data) {
    return (await api.post("/auth/register-with-otp", data)).data;
  }

  async forgotPasswordSendOtp(data) {
    return (await api.post("/auth/forgot-password/send-otp", data)).data;
  }

  async forgotPasswordVerifyOtp(data) {
    return (await api.post("/auth/forgot-password/verify-otp", data)).data;
  }

  async forgotPasswordReset(data) {
    return (await api.post("/auth/forgot-password/reset", data)).data;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user && (user.role === "admin" || user.role === "staff");
  }

  isSuperAdmin() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user && user.role === "admin";
  }
}

export default new AuthService();
