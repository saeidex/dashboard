import { ConfirmDialog } from "@/web/components/confirm-dialog";
import { showSubmittedData } from "@/web/lib/show-submitted-data";

import { OrdersActionDialog } from "./orders-action-dialog";
import { useOrders } from "./orders-provider";

export function OrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrders();
  return (
    <>
      <OrdersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <OrdersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={() => {
              setOpen("edit");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="order-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
              showSubmittedData(
                currentRow,
                "The following order has been deleted:",
              );
            }}
            className="max-w-md"
            title={`Delete this order: ${currentRow.id} ?`}
            desc={(
              <>
                You are about to delete order
                {" "}
                <strong>{currentRow.id}</strong>
                .
                <br />
                {" "}
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
