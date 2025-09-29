import { createFileRoute } from "@tanstack/react-router";

import { Expenses } from "@/web/features/accounts/expenses";
import { expensesQueryOptions } from "@/web/features/accounts/expenses/data/queries";

export const Route = createFileRoute("/_authenticated/accounts/expenses/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(expensesQueryOptions),
  component: Expenses,
});
