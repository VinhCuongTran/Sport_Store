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

// 1. Interceptor REQUEST: Tự động đính kèm Token (Access Token) trước khi gửi
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

// 2. Interceptor RESPONSE: Xử lý khi Token hết hạn (Lỗi 401)
api.interceptors.response.use(
  (response) => {
    // Nếu request thành công bình thường thì trả về kết quả
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra xem lỗi trả về có phải 401 và chưa từng thử gia hạn token chưa
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Đánh dấu là đã thử gia hạn 1 lần để tránh vòng lặp vô hạn

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Không có Refresh Token");
        }

        // Gọi API lên Backend để xin Token mới
        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh-token",
          {
            refreshToken: refreshToken,
          },
        );

        // Lấy Token mới từ Backend trả về
        const newAccessToken = res.data.accessToken;

        // Lưu lại Token mới vào localStorage
        localStorage.setItem("token", newAccessToken);

        // Gắn Token mới vào cái Request vừa bị lỗi và gửi lại lần nữa
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu việc gia hạn token cũng thất bại (Ví dụ RefreshToken cũng đã hết hạn 7 ngày)
        // Thì mới thông báo và bắt người dùng đăng nhập lại
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user"); // Tùy chọn xóa luôn info user
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
        return Promise.reject(refreshError);
      }
    }

    // Nếu là các lỗi khác (không phải 401) thì ném lỗi ra như bình thường
    return Promise.reject(error);
  },
);

export default api;
