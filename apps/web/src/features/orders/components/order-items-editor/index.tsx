import type { Currency, insertOrderItemsSchema, insertOrderWithItemsSchema, patchOrderItemsSchema } from "@crm/api/schema";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { Control, UseFormSetValue } from "react-hook-form";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,

  useReactTable,

} from "@tanstack/react-table";
import { X } from "lucide-react";
import React, { useMemo } from "react";
import { useFieldArray } from "react-hook-form";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/web/components/ui/form";
import { Input } from "@/web/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";
import { cn } from "@/web/lib/utils";

import { createProductsQueryOptions } from "../../../products/data/queries";

type EditMode = "insert" | "patch";
type OrderItem<TEditMode extends EditMode>
  = TEditMode extends "insert" ? insertOrderItemsSchema : patchOrderItemsSchema;

type OrderItemsEditorProps<TEditMode extends EditMode> = {
  editMode: TEditMode;
  items: OrderItem<TEditMode>[];
  currency?: Currency;
  control: Control<insertOrderWithItemsSchema>;
  setValue: UseFormSetValue<insertOrderWithItemsSchema>;
};

export function OrderItemsEditor<TEditMode extends EditMode = "insert">({
  items,
  currency = "BDT",
  control,
  setValue,
}: OrderItemsEditorProps<TEditMode>) {
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());

  const fieldArray = useFieldArray({
    name: "items" as const,
    control,
  });

  const columns = React.useMemo<ColumnDef<OrderItem<TEditMode>>[]>(
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
            <FormField
              control={control}
              name={`items.${idx}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 w-full min-w-24 text-center"
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const val = Math.max(1, Number.parseInt(e.target.value) || 0);
                        setValue(`items.${idx}.quantity`, val);
                      }}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
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
            {row.getValue("unitPrice")}
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
              value={items[idx]?.discountPercentage}
              onChange={(e) => {
                const val = Math.max(
                  0,
                  Math.min(100, Number.parseFloat(e.target.value) || 0),
                );
                setValue(`items.${idx}.discountPercentage`, val);
                const unitPrice = items[idx]?.unitPrice ?? 0;
                const quantity = items[idx]?.quantity ?? 1;
                const discountAmount = +(
                  unitPrice
                  * quantity
                  * (val / 100)
                ).toFixed(2);
                setValue(`items.${idx}.discountAmount`, discountAmount);
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
              value={items[idx]?.discountAmount}
              onChange={(e) => {
                const val = Math.max(0, Number.parseFloat(e.target.value) || 0);
                setValue(`items.${idx}.discountAmount`, val);
                const unitPrice = items[idx]?.unitPrice ?? 0;
                const quantity = items[idx]?.quantity ?? 1;
                const totalPrice = unitPrice * quantity;
                const discountPercentage
                  = totalPrice > 0 ? +((val / totalPrice) * 100).toFixed(2) : 0;
                setValue(
                  `items.${idx}.discountPercentage`,
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
            {row.getValue("total")}
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
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [fieldArray, control, products, items, setValue],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const grand = useMemo(
    () => items.reduce((acc, i) => acc + (i.total ?? 0), 0),
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
                    // @ts-expect-error className exists
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
                      // @ts-expect-error className exists
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
              productId: p.id,
              productTitle: p.title,
              unitPrice: p.total,
              quantity: 1,
              discountPercentage: 0,
              discountAmount: 0,
              taxPercentage: 0,
              taxAmount: 0,
              subTotal: p.total,
              total: p.total,
              currency,
            });
          }}
        >
          + Add Item
        </Button>
      </div>
    </div>
  );
}
