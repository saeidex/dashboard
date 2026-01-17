import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Size } from "../data/schema";

type SizesDialogType = "create" | "update" | "delete";

type SizesContextType = {
  open: SizesDialogType | null;
  setOpen: (str: SizesDialogType | null) => void;
  setDialogType: (str: SizesDialogType | null) => void;
  currentRow: Size | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Size | null>>;
};

const SizesContext = React.createContext<SizesContextType | null>(null);

export function SizesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SizesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Size | null>(null);

  const values = React.useMemo(
    () => ({
      open,
      setOpen,
      setDialogType: setOpen,
      currentRow,
      setCurrentRow,
    }),
    [open, setOpen, currentRow, setCurrentRow],
  );

  return <SizesContext value={values}>{children}</SizesContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSizes = () => {
  const sizesContext = React.use(SizesContext);

  if (!sizesContext) {
    throw new Error("useSizes has to be used within <SizesContext>");
  }

  return sizesContext;
};
