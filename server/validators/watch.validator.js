const { z } = require("zod");

const watchSchema = z.object({
  name: z
    .string({ required_error: "Watch name is required" })
    .min(2)
    .max(200),
  brand: z.string({ required_error: "Brand is required" }).min(1).max(100),
  model: z.string().max(200).optional().default(""),
  description: z
    .string({ required_error: "Description is required" })
    .min(10)
    .max(2000),
  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be positive"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().min(0).default(0),
  releaseDate: z.string().optional(),
});

const watchUpdateSchema = watchSchema.partial();

const watchQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional().default(""),
  brand: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(["price", "rating", "releaseDate", "createdAt", "name"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  watchSchema,
  watchUpdateSchema,
  watchQuerySchema,
};
