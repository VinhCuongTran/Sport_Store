import axios from "axios";
// Không cần import router nữa vì chúng ta sẽ dùng window.location

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

// GỘP CHUNG THÀNH 1 INTERCEPTOR DUY NHẤT ĐỂ DỄ KIỂM SOÁT
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. XỬ LÝ LỖI HẾT HẠN TOKEN (401)
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

    // 2. XỬ LÝ LỖI BỊ ADMIN KHÓA TÀI KHOẢN (403)
    const errorMessage =
      error.response?.data?.message || error.response?.data || "";
    const errorString = JSON.stringify(
      error.response?.data || "",
    ).toLowerCase();

    if (
      error.response?.status === 403 &&
      (errorString.includes("bị khóa") || errorString.includes("bị khoá"))
    ) {
      // Xóa sạch dữ liệu đăng nhập
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Chuyển hướng cứng về trang đăng nhập kèm cờ nhận diện
      window.location.href = "/login?locked=true";

      // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT:
      // Trả về một Promise treo để "nuốt" luôn cái lỗi, component sẽ không bắt được lỗi này nữa -> Không hiện thông báo góc!
      return new Promise(() => {});
    }

    // 3. CÁC LỖI KHÁC
    return Promise.reject(error);
  },
);

export default api;
