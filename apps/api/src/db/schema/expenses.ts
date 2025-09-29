import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import type { Currency } from "./orders"

import { currencySchema } from "./orders"

export const EXPENSE_CATEGORIES = [
  "materials",
  "utilities",
  "transportation",
  "office-supplies",
  "marketing",
  "meals",
  "equipment",
  "software",
  "professional-services",
  "insurance",
  "maintenance",
  "rent",
  "telecommunications",
  "training",
  "other",
] as const

export const expenseCategorySchema = z.union(
  EXPENSE_CATEGORIES.map(category => z.literal(category)),
).default("other")
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>

export const expenses = sqliteTable("expenses", {
  id       : text().primaryKey().$defaultFn(createId),
  title    : text().notNull(),
  category : text().$type<ExpenseCategory>().default("other").notNull(),
  currency : text().$type<Currency>().default("BDT").notNull(),
  amount   : real().notNull(),
  notes    : text(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_expenses_category").on(table.category),
])

export const selectExpensesSchema = createSelectSchema(expenses, {
  category : expenseCategorySchema,
  currency : currencySchema,
  createdAt: z.iso.date().nullable(),
  updatedAt: z.iso.date().nullable(),
})
export type selectExpensesSchema = z.infer<typeof selectExpensesSchema>

export const insertExpensesSchema = createInsertSchema(expenses, {
  category: expenseCategorySchema.optional(),
  currency: currencySchema.optional(),
  title   : schema => schema.min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  amount  : schema => schema.min(1, "Amount must be at least 1"),
  notes   : schema => schema.max(500, "Notes must be less than 500 characters").optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertExpensesSchema = z.infer<typeof insertExpensesSchema>

export const patchExpensesSchema = insertExpensesSchema.partial()
export type patchExpensesSchema = z.infer<typeof patchExpensesSchema>
