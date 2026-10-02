const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email("Invalid email address").optional(),
  address: z.string().trim().optional()
});

const deviceSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  type: z.enum(["mobile", "laptop", "tablet", "desktop", "other"]),
  brand: z.string().trim().min(1, "Brand is required"),
  model: z.string().trim().min(1, "Model is required"),
  serialNumber: z.string().trim().optional(),
  color: z.string().trim().optional()
});

const repairTicketSchema = z.object({
  device: z.string().min(1, "Device is required"),
  problem: z.string().trim().min(1, "Problem description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z
    .enum([
      "received",
      "diagnosing",
      "waiting_for_parts",
      "repairing",
      "testing",
      "ready",
      "delivered"
    ])
    .optional(),
  assignedTechnician: z.string().optional(),
  expectedDate: z.coerce.date().optional(),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  notes: z.string().trim().optional()
});

const invoiceSchema = z.object({
  repairTicket: z.string().min(1, "Repair ticket is required"),
  customer: z.string().min(1, "Customer is required"),
  subtotal: z.number().min(0, "Subtotal cannot be negative"),
  discount: z.number().min(0, "Discount cannot be negative").optional(),
  tax: z.number().min(0, "Tax cannot be negative").optional()
});

const paymentSchema = z.object({
  invoice: z.string().min(1, "Invoice is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["cash", "card", "upi", "bank_transfer"]),
  transactionId: z.string().trim().optional()
});

module.exports = {
  loginSchema,
  customerSchema,
  deviceSchema,
  repairTicketSchema,
  invoiceSchema,
  paymentSchema
};