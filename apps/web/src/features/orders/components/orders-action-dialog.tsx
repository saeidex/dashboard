"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderWithItemsSchema } from "@takumitex/api/schema";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { notFound, useParams } from "@tanstack/react-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/web/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/web/components/ui/form";
import { Textarea } from "@/web/components/ui/textarea";

import type { Order } from "../data/schema";

import { customersQueryOptions } from "../../customers/data/queries";
import { createProductsQueryOptions } from "../../products/data/queries";
import { orderStatusValues } from "../data/data";
import { createOrder, queryKeys, updateOrder } from "../data/queries";
import { OrderItemsEditor } from "./order-items-editor";

type OrderActionDialogProps = {
  currentRow?: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrdersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: OrderActionDialogProps) {
  const params = useParams({ from: "/_authenticated/orders/$customerId" });
  const { data: customers } = useSuspenseQuery(customersQueryOptions);
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());
  const productsById = React.useMemo(
    () => new Map(products.map(product => [product.id, product])),
    [products],
  );

  const isEdit = !!currentRow;

  // Helper to convert string dates from API to Date objects for the form
  const parseDate = (value: string | Date | null | undefined): Date | null => {
    if (!value)
      return null;
    if (value instanceof Date)
      return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const form = useForm({
    resolver: zodResolver(insertOrderWithItemsSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          customerId: params.customerId,
          orderStatus: "pending",
          paymentStatus: "unpaid",
          paymentMethod: "cash",
          currency: "BDT",
          notes: "",
          items: [],
          retailPrice: 0,
          tax: 0,
          shipping: 0,
          grandTotal: 0,
        },
  });

  const { setValue, subscribe } = form;
  const isRecalculatingRef = React.useRef(false);

  React.useEffect(() => {
    if (productsById.size === 0)
      return;

    const callback = subscribe({
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        if (isRecalculatingRef.current)
          return;

        isRecalculatingRef.current = true;
        try {
          const roundToTwo = (value: number) =>
            Number.isFinite(value) ? +value.toFixed(2) : 0;

          let totalBasePrice = 0;
          let totalTax = 0;
          let itemsGrandTotal = 0;

          // Items level calculations
          values.items?.forEach((item, index) => {
            if (!item)
              return;

            if (!item.productId)
              return;

            const product = productsById.get(item.productId);

            if (!product) {
              return;
            }

            const quantity = Number(item.quantity ?? 0);
            const unitBasePrice = product.retailPrice ?? product.total ?? 0;

            const taxPerUnit
              = product.taxAmount
                ?? (typeof product.taxPercentage === "number"
                  ? (product.taxPercentage / 100) * unitBasePrice
                  : 0);

            const lineBasePrice = unitBasePrice * quantity;
            const lineTax = taxPerUnit * quantity;
            const lineTotal = lineBasePrice + lineTax;

            totalBasePrice += lineBasePrice;
            totalTax += lineTax;
            itemsGrandTotal += lineTotal;

            // Sync per-item pricing fields with computed values so they are submitted to the API
            setValue(
              `items.${index}.retailPricePerUnit`,
              roundToTwo(unitBasePrice),
              { shouldDirty: true, shouldValidate: false },
            );
            setValue(`items.${index}.taxPerUnit`, roundToTwo(taxPerUnit), {
              shouldDirty: true,
              shouldValidate: false,
            });
            setValue(
              `items.${index}.totalRetailPrice`,
              roundToTwo(lineBasePrice),
              { shouldDirty: true, shouldValidate: false },
            );
            setValue(`items.${index}.totalTax`, roundToTwo(lineTax), {
              shouldDirty: true,
              shouldValidate: false,
            });
            setValue(`items.${index}.grandTotal`, roundToTwo(lineTotal), {
              shouldDirty: true,
              shouldValidate: false,
            });
          });

          // Order level calculations
          const shipping = Number(values.shipping ?? 0);

          const roundedBasePrice = roundToTwo(totalBasePrice);
          if ((values.retailPrice ?? 0) !== roundedBasePrice) {
            setValue("retailPrice", roundedBasePrice, { shouldDirty: true });
          }

          const roundedTax = roundToTwo(totalTax);
          if ((values.tax ?? 0) !== roundedTax) {
            setValue("tax", roundedTax, { shouldDirty: true });
          }

          const grandTotal = roundToTwo(itemsGrandTotal + shipping);
          if ((values.grandTotal ?? 0) !== grandTotal) {
            setValue("grandTotal", grandTotal, { shouldDirty: true });
          }
        }
        finally {
          isRecalculatingRef.current = false;
        }
      },
    });

    return () => callback();
  }, [productsById, setValue, subscribe]);

  const queryclient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order created successfully!");
      form.reset();
      onOpenChange(false);
      queryclient.invalidateQueries({ queryKey: ["list-orders"] });
    },
    onError: (error) => {
      toast.error(`Error creating order: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      toast.success("Order updated successfully!");
      form.reset();
      onOpenChange(false);
      queryclient.invalidateQueries({ queryKey: ["list-orders"] });
      if (currentRow) {
        queryclient.invalidateQueries(
          queryKeys.LIST_ORDER(currentRow.id.toString()),
        );
      }
    },
    onError: (error) => {
      toast.error(`Error updating order: ${error.message}`);
    },
  });

  const onSubmit = (values: insertOrderWithItemsSchema) => {
    if (isEdit) {
      updateMutation.mutate({ id: currentRow.id.toString(), order: values });
    }
    else {
      createMutation.mutate(values);
    }
  };

  const customer = customers.find(c => c.id === params.customerId);
  if (!customer) {
    throw notFound();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-6rem)] overflow-y-auto sm:max-w-xl lg:max-w-5xl">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit Order" : "Add New Order"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update order status or payment details."
              : "Create a new order (basic metadata)."}
            {" "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <FormProvider {...form}>
            <Form {...form}>
              <form
                id="order-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 px-0.5"
              >
                <div className="grid grid-cols-6 items-center w-full space-y-0 gap-x-4 gap-y-1">
                  <span className="col-span-2">Customer</span>
                  <span>{customer.name}</span>
                </div>

                <FormField
                  control={form.control}
                  name="orderStatus"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                      <FormLabel className="col-span-2 text-end">
                        Status
                      </FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                        className="col-span-4"
                        items={orderStatusValues.map(s => ({
                          label: s
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, c => c.toUpperCase()),
                          value: s,
                        }))}
                      />
                      <FormMessage className="col-span-4 col-start-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                      <FormLabel className="col-span-2 text-end">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Additional notes"
                          className="col-span-4"
                        />
                      </FormControl>
                      <FormMessage className="col-span-4 col-start-3" />
                    </FormItem>
                  )}
                />
                <OrderItemsEditor />
              </form>
            </Form>
          </FormProvider>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => form.reset()}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="order-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
