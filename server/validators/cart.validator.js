const { z } = require("zod");

const addToCartSchema = z.object({
  productId: z.string({ required_error: "Product ID is required" }),
  quantity: z.number().min(1).default(1),
});

const removeFromCartSchema = z.object({
  productId: z.string({ required_error: "Product ID is required" }),
});

module.exports = { addToCartSchema, removeFromCartSchema };
