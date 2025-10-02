import type { insertOrderWithItemsSchema } from "@crm/api/schema";

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

  const { currentRow } = useOrders();
  const isEdit = !!currentRow;

  const { control, setValue, getValues } = useFormContext<insertOrderWithItemsSchema>();
  const fieldArray = useFieldArray({ name: "items", control });

  const isItemsEmpty = !fieldArray.fields.length;

  const handleAddItem = React.useCallback(() => {
    const firstProduct = products[0];
    if (!firstProduct) {
      toast.error("No products available to add.");
      return;
    }
    fieldArray.append({
      id: isEdit ? currentRow.id : crypto.randomUUID(),
      productId: firstProduct.id,
      quantity: 1,
      additionalDiscount: 0,
      total: firstProduct.total,
    });
  }, [isEdit, currentRow, fieldArray, products]);

  const handleProductChange = React.useCallback((index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error("No products available to add.");
      return;
    }

    const quantity = getValues(`items.${index}.quantity`) ?? 1;
    const additionalDiscount = getValues(`items.${index}.additionalDiscount`) ?? 0;
    const total = (product.total * quantity) - additionalDiscount;

    fieldArray.update(index, {
      id: isEdit ? currentRow.id : crypto.randomUUID(),
      productId: product.id,
      quantity,
      additionalDiscount,
      total,
    });
  }, [products, fieldArray, isEdit, currentRow, getValues]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table className="table-fixed [&_th]:uppercase [&_th]:tracking-wide">
        <TableHeader>
          <TableRow className="divide-x divide-border bg-muted/40">
            <TableHead className="w-[320px] text-muted-foreground pl-4">Product</TableHead>
            <TableHead className="w-[120px] text-center text-muted-foreground">Qty</TableHead>
            <TableHead className="w-[140px] text-center text-muted-foreground">Unit Price</TableHead>
            <TableHead className="w-[160px] text-center text-muted-foreground">Addditional Dsc.</TableHead>
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
                          items={products.map(product => ({ label: product.title, value: product.id }))}
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
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="sr-only">Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-10 w-full text-center"
                          min={1}
                          {...field}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 1;
                            const total = fieldArray.fields[index].total;
                            const discount = getValues(`items.${index}.additionalDiscount`);
                            const newTotal = total * value - discount;
                            setValue(`items.${index}.total`, newTotal, { shouldValidate: true, shouldDirty: true });
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>

              <TableCell className="align-top text-center font-medium">
                <span className="inline-flex h-10 w-full items-center justify-center px-1">
                  {products.find(p => p.id === field.productId)?.total ?? "-"}
                </span>
              </TableCell>

              <TableCell className="align-top">
                <FormField
                  control={control}
                  name={`items.${index}.additionalDiscount`}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="sr-only">Additional Discount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="h-10 w-full text-center"
                          {...field}
                          defaultValue={0}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value);
                            const quantity = getValues(`items.${index}.quantity`);
                            const total = (fieldArray.fields[index].total * quantity) - value;
                            setValue(`items.${index}.total`, total, { shouldValidate: true, shouldDirty: true });

                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>

              <TableCell className="align-top text-right font-semibold">
                <FormField
                  control={control}
                  name={`items.${index}.total`}
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
              <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                No items added yet.
              </TableCell>
            </TableRow>
          )}
          <TableRow className="divide-x divide-border bg-muted/20">
            <TableCell colSpan={6} className="p-4">
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
