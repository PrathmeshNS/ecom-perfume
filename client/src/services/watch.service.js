import api from "./api";

export const watchService = {
  getWatches: (params) => api.get("/watches", { params }),
  getWatch: (id) => api.get(`/watches/${id}`),
  createWatch: (formData) =>
    api.post("/watches", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateWatch: (id, formData) =>
    api.put(`/watches/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteWatch: (id) => api.delete(`/watches/${id}`),
};
