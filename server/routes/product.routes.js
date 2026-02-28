const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { validate, validateQuery } = require("../middlewares/validate");
const {
  productQuerySchema,
  categorySchema,
} = require("../validators/product.validator");
const upload = require("../middlewares/upload");

// Product routes
router.get("/", validateQuery(productQuerySchema), getProducts);
router.get("/:id", getProduct);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct
);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

module.exports = router;
