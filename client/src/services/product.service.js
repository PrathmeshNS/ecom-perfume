import api from "./api";

export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
  getCategories: () => api.get("/categories"),
  createCategory: (data) => api.post("/categories", data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};
