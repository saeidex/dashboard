import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Employees } from '@/features/employees'
import {
  employeeStatusSchema,
  positionSchema,
  shiftSchema,
} from '@/features/employees/data/schema'

const employeeSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: employeeStatusSchema.optional().catch('active'),
  employeeId: z.string().optional().catch(''),
  position: positionSchema.array().optional().catch([]),
  shift: shiftSchema.array().optional().catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/employees/')({
  validateSearch: employeeSearchSchema,
  component: Employees,
})
