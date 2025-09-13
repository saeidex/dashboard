import { z } from 'zod'
import { labels, statuses } from './data'

const pricingSchema = z
  .object({
    base: z.number().nonnegative(),
    taxPercentage: z.number().min(0).max(100).default(0),
    taxAmount: z.number().nonnegative().default(0),
    total: z.number().nonnegative(),
    currency: z.union([z.literal('BDT')]).default('BDT'),
    discountPercentage: z.number().min(0).max(100).default(0),
    discountAmount: z.number().nonnegative().default(0),
  })
  .superRefine((p, ctx) => {
    const expectedDiscountAmount = +(
      p.base *
      (p.discountPercentage / 100)
    ).toFixed(2)
    if (Math.abs(p.discountAmount - expectedDiscountAmount) > 0.01) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountAmount'],
        message: `discountAmount should be base * (discountPercentage/100) = ${expectedDiscountAmount}`,
      })
    }
    const discountedBase = +(p.base - expectedDiscountAmount).toFixed(2)
    const expectedTax = +(discountedBase * (p.taxPercentage / 100)).toFixed(2)
    if (Math.abs(p.taxAmount - expectedTax) > 0.01) {
      ctx.addIssue({
        code: 'custom',
        path: ['taxAmount'],
        message: `taxAmount should be base * (taxPercentage/100) = ${expectedTax}`,
      })
    }
    const expectedTotal = +(discountedBase + expectedTax).toFixed(2)
    if (Math.abs(p.total - expectedTotal) > 0.01) {
      ctx.addIssue({
        code: 'custom',
        path: ['total'],
        message: `total should be (base - discountAmount) + taxAmount = ${expectedTotal}`,
      })
    }
  })

export const productSchema = z
  .object({
    id: z.string(),
    productId: z.string().min(3).max(20),
    title: z.string().min(3).max(100),
    status: z
      .union(statuses.map((s) => z.literal(s.value)))
      .default('available'),
    label: z.union(labels.map((l) => z.literal(l.value))).optional(),
    categoryId: z.string().optional(),
    price: z.number().nonnegative().default(0),
    pricing: pricingSchema,
    sku: z.string().min(3).max(20),
    stock: z.number().nonnegative().int(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((p, ctx) => {
    if (Math.abs(p.price - p.pricing.total) > 0.01) {
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: `price should equal pricing.total (${p.pricing.total})`,
      })
    }
  })

export type Product = z.infer<typeof productSchema>
export type ProductPricing = z.infer<typeof pricingSchema>
