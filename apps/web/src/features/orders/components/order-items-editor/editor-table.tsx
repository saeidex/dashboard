import type { insertOrderWithItemsSchema } from "@takumitex/api/schema";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel } from "@/web/components/ui/form";
import { Input } from "@/web/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";
import { createProductsQueryOptions } from "@/web/features/products/data/queries";

import { useOrders } from "../orders-provider";

export function EditorTable() {
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());

  const availableProducts = React.useMemo(
    () => products.filter(p => p.status !== "out-of-stock" && (p.stock ?? 0) > 0),
    [products],
  );

  const { currentRow } = useOrders();
  const isEdit = !!currentRow;

  const { control, setValue, getValues } = useFormContext<insertOrderWithItemsSchema>();
  const fieldArray = useFieldArray({ name: "items", control });

  const isItemsEmpty = !fieldArray.fields.length;

  const handleAddItem = React.useCallback(() => {
    const firstProduct = availableProducts[0];
    if (!firstProduct) {
      toast.error("No products available in stock to add.");
      return;
    }
    fieldArray.append({
      id: isEdit ? currentRow.id.toString() : crypto.randomUUID(),
      productId: firstProduct.id,
      quantity: 1,
      retailPricePerUnit: firstProduct.retailPrice ?? firstProduct.total ?? 0,
      taxPerUnit: firstProduct.taxAmount
        ?? (typeof firstProduct.taxPercentage === "number"
          ? (firstProduct.taxPercentage / 100) * (firstProduct.retailPrice ?? firstProduct.total ?? 0)
          : 0),
      totalRetailPrice: firstProduct.retailPrice ?? firstProduct.total ?? 0,
      totalTax: firstProduct.taxAmount
        ?? (typeof firstProduct.taxPercentage === "number"
          ? (firstProduct.taxPercentage / 100) * (firstProduct.retailPrice ?? firstProduct.total ?? 0)
          : 0),
      grandTotal: firstProduct.total ?? (firstProduct.retailPrice ?? 0) + (firstProduct.taxAmount ?? 0),
    });
  }, [isEdit, currentRow, fieldArray, availableProducts]);

  const handleProductChange = React.useCallback((index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) {
      toast.error("Selected product is not available.");
      return;
    }

    const currentQuantity = getValues(`items.${index}.quantity`) ?? 1;
    const productStock = product.stock ?? 0;

    // Adjust quantity if it exceeds new product's stock
    let adjustedQuantity = currentQuantity;
    if (currentQuantity > productStock) {
      adjustedQuantity = productStock > 0 ? productStock : 1;
      toast.warning(`Quantity adjusted to ${adjustedQuantity} based on available stock.`);
    }

    const unitBasePrice = product.retailPrice ?? product.total ?? 0;
    const taxPerUnit
      = product.taxAmount
        ?? (typeof product.taxPercentage === "number"
          ? (product.taxPercentage / 100) * unitBasePrice
          : 0);

    const lineBasePrice = unitBasePrice * adjustedQuantity;
    const lineTax = taxPerUnit * adjustedQuantity;
    const lineTotal = lineBasePrice + lineTax;

    fieldArray.update(index, {
      id: isEdit ? currentRow.id.toString() : crypto.randomUUID(),
      productId: product.id,
      quantity: adjustedQuantity,
      retailPricePerUnit: unitBasePrice,
      taxPerUnit,
      totalRetailPrice: lineBasePrice,
      totalTax: lineTax,
      grandTotal: lineTotal,
    });
  }, [availableProducts, fieldArray, isEdit, currentRow, getValues]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table className="table-fixed [&_th]:uppercase [&_th]:tracking-wide">
        <TableHeader>
          <TableRow className="divide-x divide-border bg-muted/40">
            <TableHead className="w-[320px] text-muted-foreground pl-4">Product</TableHead>
            <TableHead className="w-[120px] text-center text-muted-foreground">Qty</TableHead>
            <TableHead className="w-[140px] text-center text-muted-foreground">Unit Price</TableHead>
            <TableHead className="w-[140px] text-right text-muted-foreground">Total</TableHead>
            <TableHead className="w-[80px] text-center text-muted-foreground">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fieldArray.fields.map((field, index) => (
            <TableRow key={field.id} className="divide-x divide-border [&_td]:!py-3.5 bg-background/60 hover:bg-background/80">
              <TableCell className="align-top">
                <FormField
                  control={control}
                  name={`items.${index}.productId`}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="sr-only">Product</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          {...field}
                          className="h-10 w-full text-sm"
                          defaultValue={field.value}
                          placeholder="Select product"
                          items={availableProducts.map(product => ({
                            label: `${product.title} (Stock: ${product.stock ?? 0})`,
                            value: product.id,
                          }))}
                          onValueChange={(value) => {
                            handleProductChange(index, value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>

              <TableCell className="align-top">
                <FormField
                  control={control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => {
                    const product = availableProducts.find(p => p.id === fieldArray.fields[index].productId);
                    const maxStock = product?.stock ?? 0;

                    return (
                      <FormItem className="space-y-1">
                        <FormLabel className="sr-only">Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-10 w-full text-center"
                            min={1}
                            max={maxStock}
                            {...field}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value) || 1;

                              // Validate against stock
                              if (value > maxStock) {
                                toast.error(`Only ${maxStock} units available in stock.`);
                                return;
                              }

                              const unitPrice = fieldArray.fields[index].retailPricePerUnit ?? 0;
                              const taxPerUnit = fieldArray.fields[index].taxPerUnit ?? 0;
                              const newTotalRetail = unitPrice * value;
                              const newTotalTax = taxPerUnit * value;
                              setValue(`items.${index}.quantity`, value, { shouldValidate: true, shouldDirty: true });
                              setValue(`items.${index}.totalRetailPrice`, newTotalRetail, { shouldValidate: true, shouldDirty: true });
                              setValue(`items.${index}.totalTax`, newTotalTax, { shouldValidate: true, shouldDirty: true });
                              setValue(`items.${index}.grandTotal`, newTotalRetail + newTotalTax, { shouldValidate: true, shouldDirty: true });
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              </TableCell>

              <TableCell className="align-top text-center font-medium">
                <span className="inline-flex h-10 w-full items-center justify-center px-1">
                  {availableProducts.find(p => p.id === field.productId)?.total ?? "-"}
                </span>
              </TableCell>

              <TableCell className="align-top text-right font-semibold">
                <FormField
                  control={control}
                  name={`items.${index}.grandTotal`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Total</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10 w-full text-right pointer-events-none border-0" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>

              <TableCell className="align-top">
                <div className="flex h-10 items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!fieldArray.fields.length}
                    className="text-destructive hover:text-destructive"
                    onClick={() => fieldArray.remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {isItemsEmpty && (
            <TableRow className="divide-x divide-border">
              <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                No items added yet.
              </TableCell>
            </TableRow>
          )}
          <TableRow className="divide-x divide-border bg-muted/20">
            <TableCell colSpan={5} className="p-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
