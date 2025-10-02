import type { insertOrderWithItemsSchema } from "@crm/api/schema";

import { useFormContext, useWatch } from "react-hook-form";

import { EditorTable } from "./editor-table";

export function OrderItemsEditor() {
  const { watch } = useFormContext<insertOrderWithItemsSchema>();

  const grandTotal = watch("grandTotal");
  const items = useWatch({ name: "items" }) ?? [];
  const currency = watch("currency") ?? "BDT";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Items</div>
        <div className="font-mono text-xs">
          Items:
          {" "}
          {items.length}
          {" "}
          | Total:
          {" "}
          <span className="font-bold">{grandTotal.toFixed(2)}</span>
          {currency}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <EditorTable />
      </div>
    </div>
  );
}
