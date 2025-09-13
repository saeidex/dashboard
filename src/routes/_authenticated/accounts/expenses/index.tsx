import { createFileRoute } from '@tanstack/react-router'
import { Expenses } from '@/features/accounts/expenses'

export const Route = createFileRoute('/_authenticated/accounts/expenses/')({
  component: Expenses,
})
