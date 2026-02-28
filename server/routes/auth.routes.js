const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
  addAddress,
  deleteAddress,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  addressSchema,
} = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/address", authenticate, validate(addressSchema), addAddress);
router.delete("/address/:addressId", authenticate, deleteAddress);

module.exports = router;
