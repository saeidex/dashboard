"use client";

import { insertOrderWithItemsSchema } from "@crm/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";

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
import { Input } from "@/web/components/ui/input";
import { showSubmittedData } from "@/web/lib/show-submitted-data";

import type { Order } from "../data/schema";

import { customersQueryOptions } from "../../customers/data/queries";
import { createProductsQueryOptions } from "../../products/data/queries";
import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "../data/data";
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
  const { data: customers } = useSuspenseQuery(customersQueryOptions);
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());

  const isEdit = !!currentRow;
  const form = useForm<insertOrderWithItemsSchema>({
    resolver: zodResolver(insertOrderWithItemsSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          customerId: "",
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: "cash",
          currency: "BDT",
          notes: "",
          items: [],
          itemsTotal: 0,
          itemsTaxTotal: 0,
          discountTotal: 0,
          shipping: 0,
          grandTotal: 0,
        },
  });

  const { setValue } = form;

  const items = form.watch("items");

  React.useEffect(() => {
    items.forEach((item, index) => {
      const product = products.find(p => p.id === item.productId);
      if (!product)
        return;
      const quantity = item.quantity;
      const unitPrice = product.total;
      const subTotal = +(unitPrice * quantity).toFixed(2);
      const total = subTotal;
      if (
        item.unitPrice !== unitPrice
        || item.subTotal !== subTotal
        || item.total !== total
      ) {
        setValue(`items.${index}.unitPrice`, unitPrice);
        setValue(`items.${index}.subTotal`, subTotal);
        setValue(`items.${index}.total`, total);
      }
    });
  }, [items, products, setValue]);

  const computedTotals = React.useMemo(() => {
    const itemsTotal = +items
      .reduce((a, i) => a + (i?.subTotal ?? 0), 0)
      .toFixed(2);
    const itemsTaxTotal = +items
      .reduce((a, i) => a + (i?.taxAmount ?? 0), 0)
      .toFixed(2);
    const discountTotal = 0;
    const shipping = 0;
    const grandTotal = +(
      itemsTotal
      - discountTotal
      + itemsTaxTotal
      + shipping
    ).toFixed(2);
    return {
      itemsTotal,
      itemsTaxTotal,
      discountTotal,
      shipping,
      grandTotal,
      currency: "BDT" as const,
    };
  }, [items]);

  const onSubmit = (values: insertOrderWithItemsSchema) => {
    const now = new Date();
    const fullOrder = {
      customerId: values.customerId,
      status: values.status,
      paymentStatus: values.paymentStatus,
      paymentMethod: values.paymentMethod,
      items: values.items,
      notes: values.notes,
      createdAt: isEdit ? currentRow!.createdAt : now,
      updatedAt: now,
      ...computedTotals,
    } as insertOrderWithItemsSchema;
    showSubmittedData(fullOrder);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
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
          <Form {...form}>
            <form
              id="order-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
                <FormLabel className="col-span-2 text-end">Order #</FormLabel>
                <div className="col-span-4 font-mono text-sm">
                  {isEdit
                    ? currentRow.id
                    : "Will be generated on save"}
                </div>
              </div>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Customer
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select customer"
                      className="col-span-4"
                      items={customers.map(v => ({
                        label: v.name,
                        value: v.id,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
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
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Payment
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Payment status"
                      className="col-span-4"
                      items={paymentStatusValues.map(s => ({
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Method
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Payment method"
                      className="col-span-4"
                      items={paymentMethodValues.map(s => ({
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
                    <FormLabel className="col-span-2 text-end">Notes</FormLabel>
                    <FormControl>
                      <Input
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
              <OrderItemsEditor
                editMode="insert"
                items={items}
                control={form.control}
                setValue={setValue}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="order-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
