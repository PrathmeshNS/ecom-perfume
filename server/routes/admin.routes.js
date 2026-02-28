const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrder } = require("../controllers/order.controller");
const { uploadPaymentQR, deletePaymentQR } = require("../controllers/settings.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { updateOrderSchema } = require("../validators/order.validator");
const upload = require("../middlewares/upload");

router.use(authenticate, authorize("admin"));

router.get("/orders", getAllOrders);
router.put("/orders/:id", validate(updateOrderSchema), updateOrder);

// Payment QR management
router.post("/settings/payment-qr", upload.single("qrImage"), uploadPaymentQR);
router.delete("/settings/payment-qr", deletePaymentQR);

module.exports = router;
