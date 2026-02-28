const express = require("express");
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { categorySchema } = require("../validators/product.validator");

router.get("/", getCategories);
router.post("/", authenticate, authorize("admin"), validate(categorySchema), createCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;
