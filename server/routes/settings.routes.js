const express = require("express");
const router = express.Router();
const { getPaymentQR } = require("../controllers/settings.controller");

// Public route — checkout page fetches this
router.get("/payment-qr", getPaymentQR);

module.exports = router;
