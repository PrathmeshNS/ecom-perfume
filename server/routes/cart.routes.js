const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} = require("../controllers/cart.controller");
const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const {
  addToCartSchema,
  removeFromCartSchema,
} = require("../validators/cart.validator");

router.use(authenticate);

router.get("/", getCart);
router.post("/add", validate(addToCartSchema), addToCart);
router.post("/remove", validate(removeFromCartSchema), removeFromCart);
router.put("/update", validate(addToCartSchema), updateCartItem);
router.delete("/", clearCart);

module.exports = router;
