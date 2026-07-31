import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const orgId = localStorage.getItem("activeOrgId");
  if (orgId) {
    config.headers["x-organization-id"] = orgId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling, e.g., redirect to login on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
