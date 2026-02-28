const { z } = require("zod");

const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  addressLine: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
});

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  address: addressSchema.optional(),
  transactionId: z.string().max(100).optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(["pending", "shipped", "delivered"]).optional(),
  paymentStatus: z.enum(["pending", "paid"]).optional(),
});

module.exports = { createOrderSchema, updateOrderSchema };
