import { insertProductsSchema } from "@crm/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "node_modules/@tanstack/react-router/dist/esm/useSearch";
import { useEffect, useRef } from "react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/web/components/ui/sheet";
import { productCategories } from "@/web/features/product-categories/data/product-categories";

import type { Product } from "../data/schema";

import { labels, statuses } from "../data/data";
import { createProduct, queryKeys } from "../data/queries";

type ProductMutateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Product;
};

export function ProductsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProductMutateDrawerProps) {
  const isUpdate = !!currentRow;

  const form = useForm<insertProductsSchema>({
    resolver: zodResolver(insertProductsSchema),
    defaultValues: isUpdate
      ? currentRow
      : {
          productId: "",
          title: "",
          status: "available",
          basePrice: 0,
          discountPercentage: 0,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          total: 0,
          currency: "BDT",
          sku: "",
          stock: 0,
        },
  });

  const basePrice = useWatch({ control: form.control, name: "basePrice" });
  const discountPercentage = useWatch({
    control: form.control,
    name: "discountPercentage",
  });
  const discountAmount = useWatch({
    control: form.control,
    name: "discountAmount",
  });
  const taxPercentage = useWatch({
    control: form.control,
    name: "taxPercentage",
  });

  const lastEditedRef = useRef<"discountPercentage" | "discountAmount" | null>(
    null,
  );

  useEffect(() => {
    const b = typeof basePrice === "number" ? basePrice : 0;
    let dPct = typeof discountPercentage === "number" ? discountPercentage : 0;
    let dAmt = typeof discountAmount === "number" ? discountAmount : 0;
    const tPct = typeof taxPercentage === "number" ? taxPercentage : 0;

    if (lastEditedRef.current === "discountPercentage") {
      const expectedAmt = +(b * (dPct / 100)).toFixed(2);
      if (Math.abs(expectedAmt - dAmt) > 0.1) {
        form.setValue("discountAmount", expectedAmt, {
          shouldDirty: true,
          shouldValidate: false,
        });
        dAmt = expectedAmt;
      }
    }
    else if (lastEditedRef.current === "discountAmount") {
      // Clamp amount to basePrice
      if (dAmt > b) {
        dAmt = b;
        form.setValue("discountAmount", b, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
      const computedPct = b > 0 ? +((dAmt / b) * 100).toFixed(2) : 0;
      const clampedPct = Math.min(100, Math.max(0, computedPct));
      if (Math.abs(clampedPct - dPct) > 0.1) {
        form.setValue("discountPercentage", clampedPct, {
          shouldDirty: true,
          shouldValidate: false,
        });
        dPct = clampedPct;
      }
    }
    else {
      const expectedAmt = +(b * (dPct / 100)).toFixed(2);
      if (Math.abs(expectedAmt - dAmt) > 0.1) {
        form.setValue("discountAmount", expectedAmt, {
          shouldDirty: true,
          shouldValidate: false,
        });
        dAmt = expectedAmt;
      }
    }

    const discountedBase = +(b - dAmt).toFixed(2);
    const taxAmt = +(discountedBase * (tPct / 100)).toFixed(2);
    const total = +(discountedBase + taxAmt).toFixed(2);
    form.setValue("taxAmount", taxAmt, { shouldDirty: true });
    form.setValue("total", total, { shouldDirty: true });

    lastEditedRef.current = null;
  }, [basePrice, discountPercentage, discountAmount, taxPercentage, form]);

  const queryClient = useQueryClient();
  const search = useSearch({ from: "/_authenticated/products" });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_PRODUCTS(search));
      toast.success(`Product ${isUpdate ? "updated" : "created"} successfully`);
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
            onSubmit={form.handleSubmit(data => createMutation.mutate(data))}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PROD-1234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SKU1234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                        items={productCategories.map(c => ({
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
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium">Pricing Breakdown</h4>
              <div className="grid gap-4 md:grid-cols-6">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base</FormLabel>
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
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => {
                            lastEditedRef.current = "discountPercentage";
                            const value = Number.parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amt</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => {
                            lastEditedRef.current = "discountAmount";
                            const value = Number.parseFloat(e.target.value);
                            field.onChange(value);
                          }}
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
