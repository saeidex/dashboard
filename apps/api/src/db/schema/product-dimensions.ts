import { z } from "@hono/zod-openapi"
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const productDimensions = sqliteTable("product_dimensions", {
  id         : integer().primaryKey({ autoIncrement: true }),
  length     : real().notNull(),
  width      : real().notNull(),
  height     : real().notNull(),
  unit       : text().notNull().default("MM"),
  description: text(),
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
})

export const dimensionUnitSchema = z.enum(["MM", "CM", "M", "IN", "FT"]).default("MM")
export type DimensionUnit = z.infer<typeof dimensionUnitSchema>

export const selectProductDimensionsSchema = createSelectSchema(productDimensions, {
  unit     : dimensionUnitSchema,
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectProductDimensionsSchema = z.infer<typeof selectProductDimensionsSchema>

export const insertProductDimensionsSchema = createInsertSchema(productDimensions, {
  length     : schema => schema.min(0.01, "Length must be greater than 0"),
  width      : schema => schema.min(0.01, "Width must be greater than 0"),
  height     : schema => schema.min(0.01, "Height must be greater than 0"),
  unit       : dimensionUnitSchema.optional(),
  description: schema => schema.max(500, "Description must be at most 500 characters long").optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertProductDimensionsSchema = z.infer<typeof insertProductDimensionsSchema>

export const patchProductDimensionsSchema = insertProductDimensionsSchema.partial()
export type patchProductDimensionsSchema = z.infer<typeof patchProductDimensionsSchema>
