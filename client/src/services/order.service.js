import api from "./api";

export const orderService = {
  createOrder: (data) => api.post("/orders", data),
  getUserOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
};

export const adminOrderService = {
  getAllOrders: (params) => api.get("/admin/orders", { params }),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
};
