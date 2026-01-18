import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const employeeStatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("on-leave"),
  z.literal("terminated"),
]).default("active")
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

export const positionSchema = z.union([
  z.literal("Sourcing Manager"),
  z.literal("Merchandiser"),
  z.literal("Quality Assurance Manager"),
  z.literal("Sample Coordinator"),
  z.literal("Logistics Coordinator"),
  z.literal("Fabric Technologist"),
  z.literal("Compliance Officer"),
  z.literal("Production Planner"),
  z.literal("Pattern Master"),
  z.literal("Supply Chain Executive"),
]).default("Sourcing Manager")
export type Position = z.infer<typeof positionSchema>

export const shiftSchema = z.union([
  z.literal("Day"),
  z.literal("Evening"),
  z.literal("Night"),
]).default("Day")
export type Shift = z.infer<typeof shiftSchema>

export const employees = sqliteTable("employees", {
  id         : text().primaryKey().$defaultFn(createId),
  firstName  : text().notNull(),
  lastName   : text().notNull(),
  employeeId : text().notNull(),
  email      : text().notNull(),
  phoneNumber: text().notNull(),
  position   : text().$type<Position>().$default(() => "Sourcing Manager").notNull(),
  shift      : text().$type<Shift>().$default(() => "Day").notNull(),
  status     : text().$type<EmployeeStatus>().$default(() => "active").notNull(),
  salary     : integer({ mode: "number" }).notNull(),
  hireDate   : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  deletedAt  : integer({ mode: "timestamp" }), // Soft delete timestamp
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  uniqueIndex("uq_employees_employee_id").on(table.employeeId),
  index("idx_employees_email").on(table.email),
])

export const selectEmployeesSchema = createSelectSchema(employees, {
  position : positionSchema,
  shift    : shiftSchema,
  status   : employeeStatusSchema,
  hireDate : z.iso.date(),
  deletedAt: z.iso.date().nullable(),
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectEmployeesSchema = z.infer<typeof selectEmployeesSchema>

export const insertEmployeesSchema = createInsertSchema(employees, {
  status     : employeeStatusSchema.optional(),
  position   : positionSchema.optional(),
  shift      : shiftSchema.optional(),
  firstName  : schema => schema.min(1, "First name is required").max(100, "First name must be at most 100 characters long"),
  lastName   : schema => schema.min(1, "Last name is required").max(100, "Last name must be at most 100 characters long"),
  employeeId : schema => schema.min(1, "Employee ID is required").max(50, "Employee ID must be at most 50 characters long"),
  email      : schema => schema.email("Invalid email address").max(100, "Email must be at most 100 characters long"),
  phoneNumber: schema => schema.min(1, "Phone number is required").max(20, "Phone number must be at most 20 characters long").refine(value => /^\+?[0-9\s\-()]+$/.test(value), "Invalid phone number format"),
  salary     : schema => schema.min(0, "Salary must be a non-negative number"),
  hireDate   : z.coerce.date().default(() => new Date()),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertEmployeesSchema = z.infer<typeof insertEmployeesSchema>

export const patchEmployeesSchema = insertEmployeesSchema.partial()
export type patchEmployeesSchema = z.infer<typeof patchEmployeesSchema>
