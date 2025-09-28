import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteProduct, queryKeys } from "../data/queries";
import { ProductsImportDialog } from "./products-import-dialog";
import { ProductsMutateDrawer } from "./products-mutate-drawer";
import { useProducts } from "./products-provider";

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts();

  const queryClient = useQueryClient();
  const search = useSearch({ from: "/_authenticated/products" });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      setOpen(null);
      setCurrentRow(null);
      queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
      toast.success("Product deleted");
    },
  });

  return (
    <>
      <ProductsMutateDrawer
        key="product-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />

      <ProductsImportDialog
        key="products-import"
        open={open === "import"}
        onOpenChange={() => setOpen("import")}
      />

      {currentRow && (
        <>
          <ProductsMutateDrawer
            key={`product-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="product-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => deleteMutation.mutate(currentRow.id)}
            className="max-w-md"
            title={`Delete this product: ${currentRow.title} ?`}
            desc={(
              <>
                You are about to delete a product with the ID
                {" "}
                <strong>{currentRow.productId}</strong>
                .
                <br />
                This action cannot be undone.
              </>
            )}
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
