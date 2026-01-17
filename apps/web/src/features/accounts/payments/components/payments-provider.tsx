import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { PaymentWithRelations } from "../data/schema";

type PaymentsDialogType = "edit" | "delete";

type PaymentsContextType = {
  open: PaymentsDialogType | null;
  setOpen: (str: PaymentsDialogType | null) => void;
  currentRow: PaymentWithRelations | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<PaymentWithRelations | null>
  >;
};

const PaymentsContext = React.createContext<PaymentsContextType | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PaymentsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<PaymentWithRelations | null>(
    null,
  );

  const values = React.useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return <PaymentsContext value={values}>{children}</PaymentsContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePayments = () => {
  const paymentsContext = React.use(PaymentsContext);

  if (!paymentsContext) {
    throw new Error("usePayments has to be used within <PaymentsContext>");
  }

  return paymentsContext;
};
