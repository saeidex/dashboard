import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Factory } from "../data/schema";

type FactoriesDialogType = "add" | "edit" | "delete";

type FactoriesContextType = {
  open: FactoriesDialogType | null;
  setOpen: (str: FactoriesDialogType | null) => void;
  currentRow: Factory | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Factory | null>>;
};

const FactoriesContext = React.createContext<FactoriesContextType | null>(null);

export function FactoriesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<FactoriesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Factory | null>(null);

  const values = React.useMemo(
    () => ({ open, setOpen, currentRow, setCurrentRow }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return <FactoriesContext value={values}>{children}</FactoriesContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFactories = () => {
  const factoriesContext = React.use(FactoriesContext);

  if (!factoriesContext) {
    throw new Error("useFactories has to be used within <FactoriesContext>");
  }

  return factoriesContext;
};
