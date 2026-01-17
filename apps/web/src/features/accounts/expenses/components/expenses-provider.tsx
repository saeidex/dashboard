import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Expense } from "../data/schema";

type ExpensesDialogType = "add" | "edit" | "delete";

type ExpensesContextType = {
  open: ExpensesDialogType | null;
  setOpen: (str: ExpensesDialogType | null) => void;
  currentRow: Expense | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Expense | null>>;
};

const ExpensesContext = React.createContext<ExpensesContextType | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ExpensesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Expense | null>(null);

  const values = React.useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return <ExpensesContext value={values}>{children}</ExpensesContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useExpenses = () => {
  const expensesContext = React.use(ExpensesContext);

  if (!expensesContext) {
    throw new Error("useExpenses has to be used within <ExpensesContext>");
  }

  return expensesContext;
};
