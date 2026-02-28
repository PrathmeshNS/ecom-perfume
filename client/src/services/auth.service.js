import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  addAddress: (data) => api.post("/auth/address", data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};
