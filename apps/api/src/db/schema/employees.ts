import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import z from "zod"

export const employeeStatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("on-leave"),
  z.literal("terminated"),
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

export const positionSchema = z.union([
  z.literal("Commercial Manager"),
  z.literal("Manager"),
  z.literal("Production Manager"),
  z.literal("Corrugation Operator"),
  z.literal("Crease Operator"),
  z.literal("Pasting Operator"),
  z.literal("Printing Master"),
  z.literal("Stitching Operator"),
  z.literal("Flexo Operator"),
  z.literal("Cutting Man"),
  z.literal("Delivery Man"),
  z.literal("Helper"),
])
export type Position = z.infer<typeof positionSchema>

export const shiftSchema = z.union([
  z.literal("Day"),
  z.literal("Evening"),
  z.literal("Night"),
])
export type Shift = z.infer<typeof shiftSchema>

export const employees = sqliteTable("employees", {
  id: text().primaryKey().$defaultFn(createId),
  firstName: text().notNull(),
  lastName: text().notNull(),
  employeeId: text().notNull(),
  email: text().notNull(),
  phoneNumber: text().notNull(),
  position: text().$type<Position>().default("Helper"),
  shift: text().$type<Shift>().default("Day"),
  status: text().$type<EmployeeStatus>().default("active"),
  salary: real().notNull(),
  hireDate: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_employees_employee_id").on(table.employeeId),
  index("idx_employees_email").on(table.email),
])

export const selectEmployeesSchema = createSelectSchema(employees)
export type selectEmployeesSchema = z.infer<typeof selectEmployeesSchema>

export const insertEmployeesSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: employeeStatusSchema,
  position: positionSchema,
  shift: shiftSchema,
})
export type insertEmployeesSchema = z.infer<typeof insertEmployeesSchema>

export const patchEmployeesSchema = insertEmployeesSchema.partial()
export type patchEmployeesSchema = z.infer<typeof patchEmployeesSchema>
