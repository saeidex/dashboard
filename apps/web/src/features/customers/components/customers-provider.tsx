import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Customer } from "../data/schema";

type CustomersDialogType = "add" | "edit" | "delete";

type CustomersContextType = {
  open: CustomersDialogType | null;
  setOpen: (str: CustomersDialogType | null) => void;
  currentRow: Customer | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Customer | null>>;
};

const CustomersContext = React.createContext<CustomersContextType | null>(null);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Customer | null>(null);

  const values = React.useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return (
    <CustomersContext value={values}>
      {children}
    </CustomersContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomers = () => {
  const customersContext = React.use(CustomersContext);

  if (!customersContext) {
    throw new Error("useCustomers has to be used within <CustomersContext>");
  }

  return customersContext;
};
