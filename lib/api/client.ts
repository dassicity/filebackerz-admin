import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.filebackerz.com";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("admin-token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const onAuth = pathname.startsWith("/auth");
      if (!onAuth) {
        localStorage.removeItem("admin-token");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);
