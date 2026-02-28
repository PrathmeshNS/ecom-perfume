const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
} = require("../controllers/order.controller");
const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { createOrderSchema } = require("../validators/order.validator");

router.use(authenticate);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrder);

module.exports = router;
