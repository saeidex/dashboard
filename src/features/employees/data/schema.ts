import { z } from 'zod'

const employeeStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('on-leave'),
  z.literal('terminated'),
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

const departmentSchema = z.union([
  z.literal('Production'),
  z.literal('Quality Control'),
  z.literal('Maintenance'),
  z.literal('Shipping'),
  z.literal('Warehouse'),
  z.literal('Administration'),
])
export type Department = z.infer<typeof departmentSchema>

const positionSchema = z.union([
  z.literal('Machine Operator'),
  z.literal('Quality Inspector'),
  z.literal('Supervisor'),
  z.literal('Maintenance Technician'),
  z.literal('Warehouse Worker'),
  z.literal('Floor Manager'),
  z.literal('Safety Officer'),
])
export type Position = z.infer<typeof positionSchema>

const shiftSchema = z.union([
  z.literal('Day'),
  z.literal('Evening'),
  z.literal('Night'),
])
export type Shift = z.infer<typeof shiftSchema>

const employeeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  department: departmentSchema,
  position: positionSchema,
  shift: shiftSchema,
  salary: z.number(),
  status: employeeStatusSchema,
  hireDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Employee = z.infer<typeof employeeSchema>

export const employeeListSchema = z.array(employeeSchema)
