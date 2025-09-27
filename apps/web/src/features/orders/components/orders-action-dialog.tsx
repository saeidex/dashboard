"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

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
import { products } from "@/web/features/products/data/products";
import { vendors } from "@/web/features/vendors/data/vendors";
import { showSubmittedData } from "@/web/lib/show-submitted-data";

import type { Order } from "../data/schema";
import type { EditableOrderItem } from "./order-items-editor";

import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "../data/data";
import { orderItemSchema, orderSchema } from "../data/schema";
import { OrderItemsEditor } from "./order-items-editor";

type OrderActionDialogProps = {
  currentRow?: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  id: orderSchema.shape.id.optional(),
  customerId: orderSchema.shape.customerId,
  status: orderSchema.shape.status.default("pending"),
  paymentStatus: orderSchema.shape.paymentStatus.default("unpaid"),
  paymentMethod: orderSchema.shape.paymentMethod.optional(),
  notes: orderSchema.shape.notes.optional(),
  items: z
    .array(
      orderItemSchema.pick({
        id: true,
        productId: true,
        productTitle: true,
        sku: true,
        pricing: true,
      }),
    )
    .min(1, "At least one item is required"),
});

export type OrderUpsertInput = z.output<typeof formSchema>;

export function OrdersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: OrderActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          id: currentRow.id,
          customerId: currentRow.customerId,
          status: currentRow.status,
          paymentStatus: currentRow.paymentStatus,
          paymentMethod: currentRow.paymentMethod,
          notes: currentRow.notes ?? "",
          items: currentRow.items,
        }
      : {
          customerId: vendors[0]?.id ?? "",
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: undefined,
          notes: "",
          items: [
            (() => {
              const p = products[0];
              return {
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
                  currency: "BDT" as const,
                },
              };
            })(),
          ],
        },
  });

  const { control, watch, setValue } = form;
  const itemsFieldArray = useFieldArray({ control, name: "items" as const });

  const items = watch("items");

  useEffect(() => {
    items?.forEach((item, index) => {
      const product = products.find(p => p.id === item.productId);
      if (!product)
        return;
      const quantity = item.pricing.quantity;
      const unitPrice = product.pricing.total;
      const subTotal = +(unitPrice * quantity).toFixed(2);
      const total = subTotal;
      if (
        item.pricing.unitPrice !== unitPrice
        || item.pricing.subTotal !== subTotal
        || item.pricing.total !== total
      ) {
        setValue(`items.${index}.pricing`, {
          ...item.pricing,
          unitPrice,
          subTotal,
          total,
        });
      }
    });
  }, [items, setValue]);

  const computedTotals = useMemo(() => {
    const itemsTotal = +items
      .reduce((a, i) => a + (i?.pricing?.subTotal ?? 0), 0)
      .toFixed(2);
    const itemsTaxTotal = +items
      .reduce((a, i) => a + (i?.pricing?.taxAmount ?? 0), 0)
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

  const onSubmit = (values: OrderUpsertInput) => {
    const orderNumber = isEdit
      ? currentRow!.orderNumber
      : `ORD-${Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, "0")}`;
    const now = new Date();
    const fullOrder = {
      id: values.id ?? crypto.randomUUID(),
      orderNumber,
      customerId: values.customerId,
      status: values.status,
      paymentStatus: values.paymentStatus,
      paymentMethod: values.paymentMethod,
      items: values.items,
      totals: computedTotals,
      notes: values.notes,
      createdAt: isEdit ? currentRow!.createdAt : now,
      updatedAt: now,
    };
    const parsed = orderSchema.parse(fullOrder);
    showSubmittedData(parsed);
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
                    ? currentRow.orderNumber
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
                      items={vendors.map(v => ({
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
                        placeholder="Additional notes"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <OrderItemsEditor
                items={items as unknown as EditableOrderItem[]}
                fieldArray={itemsFieldArray}
                setValue={setValue}
                currency="BDT"
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
