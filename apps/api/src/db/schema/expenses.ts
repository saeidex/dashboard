import type z from "zod"

import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const expenses = sqliteTable("expenses", {
  id: text().primaryKey().$defaultFn(createId),
  title: text().notNull(),
  category: text().notNull().default("other"),
  amount: real().notNull(),
  currency: text().notNull().default("BDT"),
  referenceId: text(),
  notes: text(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_expenses_category").on(table.category),
])

export const selectExpensesSchema = createSelectSchema(expenses)
export type selectExpensesSchema = z.infer<typeof selectExpensesSchema>

export const insertExpensesSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertExpensesSchema = z.infer<typeof insertExpensesSchema>

export const patchExpensesSchema = insertExpensesSchema.partial()
export type patchExpensesSchema = z.infer<typeof patchExpensesSchema>
