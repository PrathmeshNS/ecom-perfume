const { z } = require("zod");

const productSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .min(2)
    .max(200),
  description: z
    .string({ required_error: "Description is required" })
    .min(10)
    .max(2000),
  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be positive"),
  categoryId: z.string({ required_error: "Category is required" }),
  brand: z.string({ required_error: "Brand is required" }).min(1).max(100),
  stock: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).optional(),
});

const productUpdateSchema = productSchema.partial();

const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional().default(""),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.string().optional().default("-createdAt"),
});

const categorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(2)
    .max(100),
  slug: z
    .string({ required_error: "Slug is required" })
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
});

module.exports = {
  productSchema,
  productUpdateSchema,
  productQuerySchema,
  categorySchema,
};
