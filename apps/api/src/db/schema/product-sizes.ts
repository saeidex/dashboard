import { z } from "@hono/zod-openapi"
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const productSizes = sqliteTable("product_sizes", {
  id         : integer().primaryKey({ autoIncrement: true }),
  length     : real(),
  width      : real(),
  height     : real(),
  unit       : text().notNull().default("M"),
  description: text(),
  deletedAt  : integer({ mode: "timestamp" }), // Soft delete timestamp
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
})

// TODO: Remove static size unit options and allow custom units
export const sizeUnitSchema = z.enum(["XS", "S", "M", "L", "XL", "XXL"]).or(z.string()).default("M")
export type SizeUnit<T extends string = "M"> = z.infer<typeof sizeUnitSchema> | T

export const selectProductSizesSchema = createSelectSchema(productSizes).extend({
  unit     : sizeUnitSchema,
  deletedAt: z.iso.date().nullable(),
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectProductSizesSchema = z.infer<typeof selectProductSizesSchema>

export const insertProductSizesSchema = createInsertSchema(productSizes, {
  length     : schema => schema.min(0.01, "Length must be greater than 0").optional(),
  width      : schema => schema.min(0.01, "Width must be greater than 0").optional(),
  height     : schema => schema.min(0.01, "Height must be greater than 0").optional(),
  unit       : sizeUnitSchema.optional(),
  description: schema => schema.max(500, "Description must be at most 500 characters long").optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertProductSizesSchema = z.infer<typeof insertProductSizesSchema>

export const patchProductSizesSchema = insertProductSizesSchema.partial()
export type patchProductSizesSchema = z.infer<typeof patchProductSizesSchema>
