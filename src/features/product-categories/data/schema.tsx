import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().max(200).optional(),
  image: z.url(),
})

export type Category = z.infer<typeof categorySchema>
