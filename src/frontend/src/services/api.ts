import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Phiên đăng nhập hết hạn hoặc tài khoản bị khóa!");

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        const errorMsg =
          error.response.data?.error?.message || "session_expired";
        window.location.href = `/login?error=${encodeURIComponent(errorMsg)}`;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
