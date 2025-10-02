import React, { useState } from "react";

import useDialogState from "@/web/hooks/use-dialog-state";

import type { Product } from "../data/schema.ts";

type ProductsDialogType = "create" | "update" | "delete" | "import";

type ProductsContextType = {
  open: ProductsDialogType | null;
  setOpen: (str: ProductsDialogType | null) => void;
  currentRow: Product | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>;
};

const ProductsContext = React.createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Product | null>(null);

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
    <ProductsContext value={values}>
      {children}
    </ProductsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const productsContext = React.use(ProductsContext);

  if (!productsContext) {
    throw new Error("useProducts has to be used within <ProductsContext>");
  }

  return productsContext;
};
