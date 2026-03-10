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
    return Promise.reject(error);
  },
);

export default api;
