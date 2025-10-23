import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Dimension } from "../data/schema";

type DimensionsDialogType = "create" | "update" | "delete";

type DimensionsContextType = {
  open: DimensionsDialogType | null;
  setOpen: (str: DimensionsDialogType | null) => void;
  setDialogType: (str: DimensionsDialogType | null) => void;
  currentRow: Dimension | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Dimension | null>>;
};

const DimensionsContext = React.createContext<DimensionsContextType | null>(
  null,
);

export function DimensionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<DimensionsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Dimension | null>(null);

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

  return (
    <DimensionsContext value={values}>
      {children}
    </DimensionsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDimensions = () => {
  const dimensionsContext = React.use(DimensionsContext);

  if (!dimensionsContext) {
    throw new Error("useDimensions has to be used within <DimensionsContext>");
  }

  return dimensionsContext;
};
