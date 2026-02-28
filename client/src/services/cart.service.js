import api from "./api";

export const cartService = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity = 1) =>
    api.post("/cart/add", { productId, quantity }),
  removeFromCart: (productId) => api.post("/cart/remove", { productId }),
  updateQuantity: (productId, quantity) =>
    api.put("/cart/update", { productId, quantity }),
  clearCart: () => api.delete("/cart"),
};
