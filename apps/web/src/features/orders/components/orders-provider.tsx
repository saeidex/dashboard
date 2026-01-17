import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Order } from "../data/schema";

type OrdersDialogType = "add" | "edit" | "delete" | "pay";

type OrdersContextType = {
  open: OrdersDialogType | null;
  setOpen: (str: OrdersDialogType | null) => void;
  currentRow: Order | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Order | null>>;
};

const OrdersContext = React.createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OrdersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Order | null>(null);

  const values = React.useMemo(
    () => ({
      open,
      setOpen,
      currentRow,
      setCurrentRow,
    }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return (
    <OrdersContext value={values}>
      {children}
    </OrdersContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ordersContext = React.use(OrdersContext);

  if (!ordersContext) {
    throw new Error("useOrders has to be used within <OrdersContext>");
  }

  return ordersContext;
};
