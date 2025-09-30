import { z } from "@hono/zod-openapi"
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const productCategories = sqliteTable("categories", {
  id         : integer().primaryKey({ autoIncrement: true }),
  name       : text().notNull(),
  description: text(),
  image      : blob({ mode: "buffer" }).notNull(),
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
})

const imageOpenApi = {
  type       : "string" as const,
  format     : "byte" as const,
  description: "Image data for the product category encoded as a base64 data URL.",
  example    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
}

const dataUrlRegex = /^data:image\/(?:png|jpe?g);base64,/i

const imageDataUrlSchema = z
  .string()
  .min(1, "Image is required")
  .refine(value => dataUrlRegex.test(value), {
    message: "Image must be a base64-encoded PNG or JPEG data URL",
  })
  .openapi(imageOpenApi)

export const selectProductCategoriesSchema = createSelectSchema(productCategories, {
  image    : imageDataUrlSchema,
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectProductCategoriesSchema = z.infer<typeof selectProductCategoriesSchema>

const insertProductCategoriesSchemaBase = createInsertSchema(productCategories, {
  image      : imageDataUrlSchema,
  name       : schema => schema.min(1, "Name is required").max(100, "Name must be at most 100 characters long"),
  description: schema => schema.max(500, "Description must be at most 500 characters long").optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})

export const insertProductCategoriesSchema = insertProductCategoriesSchemaBase
export type insertProductCategoriesSchema = z.infer<typeof insertProductCategoriesSchema>

export const patchProductCategoriesSchema = insertProductCategoriesSchema.partial()
export type patchProductCategoriesSchema = z.infer<typeof patchProductCategoriesSchema>
