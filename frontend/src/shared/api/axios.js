import axios from "axios";
import { API_URL } from "../../config.js";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
