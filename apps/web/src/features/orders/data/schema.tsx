import { z } from "zod";

import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "./data";

const currencySchema = z.union([z.literal("BDT")]).default("BDT");

export const orderItemPricingSchema = z
  .object({
    unitPrice: z.number().nonnegative(),
    quantity: z.number().int().positive(),
    discountPercentage: z.number().min(0).max(100).default(0),
    discountAmount: z.number().nonnegative().default(0),
    taxPercentage: z.number().min(0).max(100).default(0),
    taxAmount: z.number().nonnegative().default(0),
    subTotal: z.number().nonnegative(),
    total: z.number().nonnegative(),
    currency: currencySchema,
  })
  .superRefine((p, ctx) => {
    const gross = +(p.unitPrice * p.quantity).toFixed(2);
    const expectedDiscount = +(gross * (p.discountPercentage / 100)).toFixed(2);
    if (Math.abs(p.discountAmount - expectedDiscount) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: `discountAmount should be gross * (discountPercentage/100) = ${expectedDiscount}`,
      });
    }
    const discountedGross = +(gross - expectedDiscount).toFixed(2);
    const expectedTax = +(discountedGross * (p.taxPercentage / 100)).toFixed(2);
    if (Math.abs(p.taxAmount - expectedTax) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["taxAmount"],
        message: `taxAmount should be (gross - discountAmount) * (taxPercentage/100) = ${expectedTax}`,
      });
    }
    const expectedSubTotal = discountedGross;
    if (Math.abs(p.subTotal - expectedSubTotal) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["subTotal"],
        message: `subTotal should be gross - discountAmount = ${expectedSubTotal}`,
      });
    }
    const expectedTotal = +(expectedSubTotal + expectedTax).toFixed(2);
    if (Math.abs(p.total - expectedTotal) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["total"],
        message: `total should be subTotal + taxAmount = ${expectedTotal}`,
      });
    }
  });

export const orderItemSchema = z.object({
  id: z.uuid(),
  productId: z.string(),
  productTitle: z.string(),
  sku: z.string(),
  pricing: orderItemPricingSchema,
});

export const orderTotalsSchema = z
  .object({
    itemsTotal: z.number().nonnegative(),
    itemsTaxTotal: z.number().nonnegative(),
    discountTotal: z.number().nonnegative().default(0),
    shipping: z.number().nonnegative().default(0),
    grandTotal: z.number().nonnegative(),
    currency: currencySchema,
  })
  .superRefine((t, ctx) => {
    const expectedGrand = +(
      t.itemsTotal
      - t.discountTotal
      + t.itemsTaxTotal
      + t.shipping
    ).toFixed(2);
    if (Math.abs(t.grandTotal - expectedGrand) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["grandTotal"],
        message: `grandTotal should be itemsTotal - discountTotal + itemsTaxTotal + shipping = ${expectedGrand}`,
      });
    }
  });

export const orderSchema = z
  .object({
    id: z.string().uuid(),
    orderNumber: z
      .string()
      .regex(/^ORD-\d{6}$/i, "orderNumber must match pattern ORD-XXXXXX"),
    customerId: z.string(),
    status: z
      .union(orderStatusValues.map(v => z.literal(v)))
      .default("pending"),
    paymentStatus: z
      .union(paymentStatusValues.map(v => z.literal(v)))
      .default("unpaid"),
    paymentMethod: z
      .union(paymentMethodValues.map(v => z.literal(v)))
      .optional(),
    items: z.array(orderItemSchema).min(1),
    totals: orderTotalsSchema,
    notes: z.string().max(500).optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .superRefine((order, ctx) => {
    const itemsTotal = +order.items
      .reduce((acc, i) => acc + i.pricing.subTotal, 0)
      .toFixed(2);
    const itemsTaxTotal = +order.items
      .reduce((acc, i) => acc + i.pricing.taxAmount, 0)
      .toFixed(2);
    if (Math.abs(order.totals.itemsTotal - itemsTotal) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["totals", "itemsTotal"],
        message: `itemsTotal should equal sum(item.subTotal) = ${itemsTotal}`,
      });
    }
    if (Math.abs(order.totals.itemsTaxTotal - itemsTaxTotal) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["totals", "itemsTaxTotal"],
        message: `itemsTaxTotal should equal sum(item.taxAmount) = ${itemsTaxTotal}`,
      });
    }
  });

export type OrderItemPricing = z.infer<typeof orderItemPricingSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderTotals = z.infer<typeof orderTotalsSchema>;
export type Order = z.infer<typeof orderSchema>;
