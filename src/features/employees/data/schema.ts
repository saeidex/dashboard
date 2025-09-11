import { z } from 'zod'

export const employeeStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('on-leave'),
  z.literal('terminated'),
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

export const positionSchema = z.union([
  z.literal('Commercial Manager'),
  z.literal('Manager'),
  z.literal('Production Manager'),
  z.literal('Corrugation Operator'),
  z.literal('Crease Operator'),
  z.literal('Pasting Operator'),
  z.literal('Printing Master'),
  z.literal('Stitching Operator'),
  z.literal('Flexo Operator'),
  z.literal('Cutting Man'),
  z.literal('Delivery Man'),
  z.literal('Helper'),
])
export type Position = z.infer<typeof positionSchema>

export const shiftSchema = z.union([
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
