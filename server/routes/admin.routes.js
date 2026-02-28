const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrder } = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { updateOrderSchema } = require("../validators/order.validator");

router.use(authenticate, authorize("admin"));

router.get("/orders", getAllOrders);
router.put("/orders/:id", validate(updateOrderSchema), updateOrder);

module.exports = router;
