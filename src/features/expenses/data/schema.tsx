import z from 'zod'

export const EXPENSE_CATEGORIES = [
  'materials',
  'utilities',
  'transportation',
  'office-supplies',
  'marketing',
  'meals',
  'equipment',
  'software',
  'professional-services',
  'insurance',
  'maintenance',
  'rent',
  'telecommunications',
  'training',
  'other',
] as const

export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES)

export const expenseSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  category: expenseCategorySchema.default('other'),
  amount: z.number().positive('Amount must be positive'),
  referenceId: z.string().max(100).optional(),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type Expense = z.infer<typeof expenseSchema>
