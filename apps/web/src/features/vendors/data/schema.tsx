import z from "zod";

export const vendorSchema = z.object({
  id: z.uuid(),
  vendorId: z.string().min(1, "Vendor ID is required"),
  name: z.string().min(1, "Vendor name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isActive: z.boolean().default(true),
});

export type Vendor = z.infer<typeof vendorSchema>;
