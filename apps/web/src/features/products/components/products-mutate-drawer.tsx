"use client";

import { insertProductsSchema } from "@crm/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/web/components/ui/form";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/web/components/ui/sheet";

import type { Product } from "../data/schema";

import { categoriesQueryOptions } from "../../product-categories/data/queries";
import { dimensionsQueryOptions } from "../../product-dimensions/data/queries";
import { labels, statuses } from "../data/data";
import { createProduct, queryKeys, updateProduct } from "../data/queries";

type ProductMutateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Product;
};

const route = getRouteApi("/_authenticated/products/");

export function ProductsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProductMutateDrawerProps) {
  const isUpdate = !!currentRow;
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: dimensions } = useSuspenseQuery(dimensionsQueryOptions);

  const form = useForm<insertProductsSchema>({
    resolver: zodResolver(insertProductsSchema),
    defaultValues: isUpdate
      ? currentRow
      : {
          title: "",
          status: "available",
          retailPrice: 0,
          taxPercentage: 0,
          taxAmount: 0,
          total: 0,
          currency: "BDT",
          stock: 0,
        },
  });

  const retailPrice = useWatch({ control: form.control, name: "retailPrice" });
  const taxPercentage = useWatch({
    control: form.control,
    name: "taxPercentage",
  });

  useEffect(() => {
    const b = typeof retailPrice === "number" ? retailPrice : 0;
    const tPct = typeof taxPercentage === "number" ? taxPercentage : 0;
    const taxAmt = +((b) * (tPct / 100)).toFixed(2);
    const total = +(b + taxAmt).toFixed(2);
    form.setValue("taxAmount", taxAmt, { shouldDirty: true });
    form.setValue("total", total, { shouldDirty: true });
  }, [retailPrice, taxPercentage, form]);

  const queryClient = useQueryClient();
  const search = route.useSearch();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
      toast.success(`Product created successfully`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
      toast.success(`Product updated successfully`);
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col sm:min-w-3xl">
        <SheetHeader className="text-start">
          <SheetTitle>
            {isUpdate ? "Update" : "Create"}
            {" "}
            Product
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the product by providing necessary info."
              : "Add a new product by providing necessary info."}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="products-form"
            onSubmit={form.handleSubmit((data) => {
              isUpdate ? updateMutation.mutate({ id: currentRow.id, product: data }) : createMutation.mutate(data);
            })}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            {isUpdate
              && (
                <FormField
                  name="id"
                  render={() => (
                    <FormItem className="flex gap-2">
                      <FormLabel>ID: </FormLabel>
                      <FormControl>
                        <Label className="font-medium">{currentRow.id}</Label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select dropdown"
                      items={statuses.map(status => ({
                        value: status.value,
                        label: status.label,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <div className="flex items-center gap-2">
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value ?? ""}
                        onValueChange={v => field.onChange(v || undefined)}
                        placeholder="Select label"
                        items={labels.map(l => ({
                          value: l.value,
                          label: l.label,
                        }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange(undefined)}
                        disabled={!field.value}
                      >
                        Clear
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value?.toString() || ""}
                        onValueChange={field.onChange}
                        placeholder="Select category"
                        items={categories.map(c => ({
                          value: c.id.toString(),
                          label: c.name,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e =>
                          field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimension</FormLabel>
                    <div className="flex items-center gap-2">
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value?.toString() ?? ""}
                        onValueChange={v => field.onChange(v ? Number.parseInt(v) : undefined)}
                        placeholder="Select dimension"
                        items={dimensions.map(d => ({
                          value: d.id.toString(),
                          label: `${d.length} x ${d.width} x ${d.height} ${d.unit}`,
                        }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange(undefined)}
                        disabled={!field.value}
                      >
                        Clear
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium">Pricing Breakdown</h4>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="retailPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retail Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={e =>
                            field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={e =>
                            field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="products-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
