import axios from "axios";

const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  ...commonConfig,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý hết hạn Token (401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Không có Refresh Token");
        }
        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh-token",
          {
            refreshToken: refreshToken,
          },
        );
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    const errorString = JSON.stringify(
      error.response?.data || "",
    ).toLowerCase();

    // Xử lý cấm truy cập (403)
    if (error.response?.status === 403) {
      // Trường hợp 1: Tài khoản bị khóa
      if (errorString.includes("bị khóa") || errorString.includes("bị khoá")) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login?locked=true";
        return new Promise(() => {});
      }

      // Trường hợp 2: Bị hạ quyền (từ staff -> user) hoặc không có quyền truy cập
      if (
        errorString.includes("quyền truy cập đã thay đổi") ||
        errorString.includes("không có quyền")
      ) {
        alert("Quyền hạn của bạn đã thay đổi. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  },
);

export default api;
