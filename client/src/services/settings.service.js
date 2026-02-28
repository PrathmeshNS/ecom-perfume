import api from "./api";

export const settingsService = {
  getPaymentQR: () => api.get("/settings/payment-qr"),
  uploadPaymentQR: (formData) =>
    api.post("/admin/settings/payment-qr", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePaymentQR: () => api.delete("/admin/settings/payment-qr"),
};
