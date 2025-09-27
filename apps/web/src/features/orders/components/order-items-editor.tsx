import type { ColumnDef } from "@tanstack/react-table";

import {

  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import { Input } from "@/web/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";
import { products } from "@/web/features/products/data/products";
import { cn } from "@/web/lib/utils";

import type { OrderItem } from "../data/schema";

// Deliberately using loose typing for integration with dynamic RHF form
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldArray = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySetValue = any;

// Allow possibly partially filled pricing while editing
export type EditableOrderItem = Omit<OrderItem, "pricing"> & {
  pricing: OrderItem["pricing"] & {
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
  };
};

type OrderItemsEditorProps = {
  items: EditableOrderItem[];
  fieldArray: AnyFieldArray;
  setValue: AnySetValue;
  currency?: "BDT";
};

export function OrderItemsEditor({
  items,
  fieldArray,
  setValue,
  currency = "BDT",
}: OrderItemsEditorProps) {
  const columns = useMemo<ColumnDef<EditableOrderItem>[]>(
    () => [
      {
        accessorKey: "productTitle",
        header: () => <div className="pl-3">Product</div>,
        cell: ({ row }) => {
          const idx = row.index;
          return (
            <SelectDropdown
              className="w-full"
              defaultValue={items[idx]?.productId}
              onValueChange={(val) => {
                const product = products.find(p => p.id === val);
                if (!product)
                  return;
                setValue(`items.${idx}.productId`, product.id);
                setValue(`items.${idx}.productTitle`, product.title);
                setValue(`items.${idx}.sku`, product.sku);
                // unit price & totals recalculated effect remains in parent
              }}
              placeholder="Product"
              items={products.map(p => ({ label: p.title, value: p.id }))}
            />
          );
        },
      },
      {
        id: "quantity",
        header: () => <div className="text-center">Qty</div>,
        cell: ({ row }) => {
          const idx = row.index;
          return (
            <Input
              type="number"
              min={1}
              value={items[idx]?.pricing.quantity}
              onChange={(e) => {
                const q = Math.max(1, Number.parseInt(e.target.value) || 1);
                setValue(`items.${idx}.pricing.quantity`, q);
              }}
              className="h-8 w-full min-w-24 text-center"
            />
          );
        },
        meta: { className: "w-16" },
      },
      {
        id: "unitPrice",
        header: () => <div className="text-center">Unit Price</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono tabular-nums">
            {row.original.pricing.unitPrice.toFixed(2)}
          </div>
        ),
        meta: { className: "w-24" },
      },
      {
        id: "discountPercentage",
        header: () => <div className="text-center">Disc %</div>,
        cell: ({ row }) => {
          const idx = row.index;
          return (
            <Input
              type="number"
              min={0}
              max={100}
              value={items[idx]?.pricing.discountPercentage}
              onChange={(e) => {
                const val = Math.max(
                  0,
                  Math.min(100, Number.parseFloat(e.target.value) || 0),
                );
                setValue(`items.${idx}.pricing.discountPercentage`, val);
                const unitPrice = items[idx]?.pricing.unitPrice ?? 0;
                const quantity = items[idx]?.pricing.quantity ?? 1;
                const discountAmount = +(
                  unitPrice
                  * quantity
                  * (val / 100)
                ).toFixed(2);
                setValue(`items.${idx}.pricing.discountAmount`, discountAmount);
              }}
              className="h-8 w-full min-w-24 text-center"
            />
          );
        },
        meta: { className: "w-20" },
      },
      {
        id: "discountAmount",
        header: () => <div className="text-center">Disc Amt</div>,
        cell: ({ row }) => {
          const idx = row.index;
          return (
            <Input
              type="number"
              min={0}
              value={items[idx]?.pricing.discountAmount}
              onChange={(e) => {
                const val = Math.max(0, Number.parseFloat(e.target.value) || 0);
                setValue(`items.${idx}.pricing.discountAmount`, val);
                const unitPrice = items[idx]?.pricing.unitPrice ?? 0;
                const quantity = items[idx]?.pricing.quantity ?? 1;
                const totalPrice = unitPrice * quantity;
                const discountPercentage
                  = totalPrice > 0 ? +((val / totalPrice) * 100).toFixed(2) : 0;
                setValue(
                  `items.${idx}.pricing.discountPercentage`,
                  discountPercentage,
                );
              }}
              className="h-8 w-full min-w-24 text-center"
            />
          );
        },
        meta: { className: "w-24" },
      },
      {
        id: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs tabular-nums">
            {row.original.pricing.total.toFixed(2)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="sr-only">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            {fieldArray.fields.length > 1 && (
              <button
                type="button"
                className="text-xs text-red-500 hover:underline"
                onClick={() => fieldArray.remove(row.index)}
              >
                ✕
              </button>
            )}
          </div>
        ),
      },
    ],
    [fieldArray, items, setValue],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const grand = useMemo(
    () => items.reduce((acc, i) => acc + (i.pricing.total ?? 0), 0),
    [items],
  );

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
          <span className="font-bold">{grand.toFixed(2)}</span>
          {" "}
          {currency}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/40">
                {hg.headers.map(h => (
                  <TableHead
                    key={h.id}
                    className={cn(h.column.columnDef.meta?.className ?? "")}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="group/row">
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "group-hover/row:bg-muted/40 align-middle",
                      cell.column.columnDef.meta?.className ?? "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary hover:underline"
          onClick={() => {
            const p = products[0];
            fieldArray.append({
              id: crypto.randomUUID(),
              productId: p.id,
              productTitle: p.title,
              sku: p.sku,
              pricing: {
                unitPrice: p.pricing.total,
                quantity: 1,
                discountPercentage: 0,
                discountAmount: 0,
                taxPercentage: 0,
                taxAmount: 0,
                subTotal: p.pricing.total,
                total: p.pricing.total,
                currency,
              },
            });
          }}
        >
          + Add Item
        </Button>
      </div>
    </div>
  );
}
