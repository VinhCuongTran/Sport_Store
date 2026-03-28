import api from "./api.service";

class AuthService {
  // ─── Đăng nhập ──────────────────────────────────────────────────────────
  async login(data) {
    return (await api.post("/auth/login", data)).data;
  }

  // ─── Đăng ký ────────────────────────────────────────────────────────────
  async checkExists(data) {
    // { email, phone_number }
    return (await api.post("/auth/check-exists", data)).data;
  }

  async sendOtp(data) {
    // { method: 'email' | 'phone', email, phone_number }
    return (await api.post("/auth/send-otp", data)).data;
  }

  async registerWithOtp(data) {
    // { name, email, phone_number, password, gender, otp, method }
    return (await api.post("/auth/register-with-otp", data)).data;
  }

  // ─── Quên mật khẩu ──────────────────────────────────────────────────────
  async forgotPasswordSendOtp(data) {
    return (await api.post("/auth/forgot-password/send-otp", data)).data;
  }

  async forgotPasswordVerifyOtp(data) {
    return (await api.post("/auth/forgot-password/verify-otp", data)).data;
  }

  async forgotPasswordReset(data) {
    return (await api.post("/auth/forgot-password/reset", data)).data;
  }

  // ─── Tiện ích ────────────────────────────────────────────────────────────
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
