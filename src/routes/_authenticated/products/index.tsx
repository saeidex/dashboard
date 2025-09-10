import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Products } from '@/features/products'
import { categories, statuses } from '@/features/products/data/data'

const productSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  category: z
    .array(z.enum(categories.map((category) => category.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/products/')({
  validateSearch: productSearchSchema,
  component: Products,
})
