"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DatePicker } from "@/web/components/date-picker";
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
import { Textarea } from "@/web/components/ui/textarea";
import { createPayment as createPaymentApi } from "@/web/features/accounts/payments/data/queries";

import type { Order } from "../data/schema";

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "Mobile Wallet", value: "mobile-wallet" },
];

const createPaymentFormSchema = (maxAmount: number) =>
  z.object({
    amount: z
      .number()
      .min(0.01, `Amount must be at least ৳0`)
      .max(maxAmount, `Amount must be at most ৳${maxAmount}`),
    paymentMethod: z.enum(["cash", "card", "bank-transfer", "mobile-wallet"]),
    reference: z
      .string()
      .max(100, "Reference must be less than 100 characters")
      .optional(),
    notes: z
      .string()
      .max(500, "Notes must be less than 500 characters")
      .optional(),
    paidAt: z.date().optional(),
  });

type PaymentFormValues = z.infer<ReturnType<typeof createPaymentFormSchema>>;

type OrderPaymentDialogProps = {
  type?: "pay" | "refund";
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderPaymentDialog({
  type = "pay",
  order,
  open,
  onOpenChange,
}: OrderPaymentDialogProps) {
  const queryClient = useQueryClient();

  // Default to the remaining due amount
  const dueAmount = order
    ? Math.max(0, order.grandTotal - (order.totalPaid ?? 0))
    : 0;
  const refundAmount = order?.totalPaid ?? 0;

  const MAX_PAYMENT_AMOUNT = dueAmount;
  const MAX_REFUND_AMOUNT = refundAmount;

  const paymentSchema = createPaymentFormSchema(
    type === "pay" ? MAX_PAYMENT_AMOUNT : MAX_REFUND_AMOUNT,
  );

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: type === "pay" ? dueAmount : refundAmount,
      paymentMethod: "cash",
      reference: "",
      notes: "",
      paidAt: new Date(),
    },
  });

  // Reset form when order changes or dialog opens
  const handleOpenChange = (state: boolean) => {
    if (state && order) {
      const remaining = Math.max(0, order.grandTotal - (order.totalPaid ?? 0));
      form.reset({
        amount: type === "pay" ? remaining : refundAmount,
        paymentMethod: "cash",
        reference: "",
        notes: "",
        paidAt: new Date(),
      });
    }
    onOpenChange(state);
  };

  const createMutation = useMutation({
    mutationFn: createPaymentApi,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["list-payments"] });
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
      toast.success("Payment recorded successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    if (!order)
      return;

    createMutation.mutate({
      orderId: order.id,
      customerId: order.customerId,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      currency: "BDT",
      reference: values.reference || null,
      notes: values.notes || null,
      paidAt: values.paidAt,
    });
  };

  if (!order)
    return null;

  const isPending = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {type === "pay" ? "Record Payment" : "Record Refund"}
          </DialogTitle>
          <DialogDescription>
            Record a payment for Order #
            {order.id}
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{order.customer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Total:</span>
            <span className="font-semibold">
              ৳
              {order.grandTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ৳
              {(order.totalPaid ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Amount:</span>
            <span
              className={`font-semibold ${
                order.grandTotal - (order.totalPaid ?? 0) > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              ৳
              {Math.max(
                0,
                order.grandTotal - (order.totalPaid ?? 0),
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Status:</span>
            <span
              className={`font-medium ${
                order.paymentStatus === "paid"
                  ? "text-green-600"
                  : order.paymentStatus === "partial"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {order.paymentStatus.charAt(0).toUpperCase()
                + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="order-payment-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative col-span-4">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ৳
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                          value={field.value || ""}
                          step={0.01}
                          min={0}
                          max={type === "pay" ? MAX_PAYMENT_AMOUNT : MAX_REFUND_AMOUNT}
                          onChange={e =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0,
                            )}
                        />
                      </div>
                    </FormControl>
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
                      placeholder="Select method"
                      className="col-span-4"
                      items={PAYMENT_METHODS}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Reference
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Transaction ID, check #, etc."
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Paid Date
                    </FormLabel>
                    <div className="col-span-4">
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Select date"
                      />
                    </div>
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
                      <Textarea
                        placeholder="Optional notes..."
                        className="col-span-4 min-h-20"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="order-payment-form" disabled={isPending}>
            {isPending
              ? "Recording..."
              : type === "pay"
                ? "Record Payment"
                : "Record Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
