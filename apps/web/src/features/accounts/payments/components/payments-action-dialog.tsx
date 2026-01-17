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

import type { PaymentWithRelations } from "../data/schema";

import { updatePayment } from "../data/queries";

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "Mobile Wallet", value: "mobile-wallet" },
];

// Form schema for editing payments - only editable fields
const paymentFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "card", "bank-transfer", "mobile-wallet"]),
  reference: z
    .string()
    .max(100, "Reference must be less than 100 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
  paidAt: z.date().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

type PaymentsActionDialogProps = {
  currentRow: PaymentWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: PaymentsActionDialogProps) {
  const defaultValues: PaymentFormValues = {
    amount: currentRow.amount,
    paymentMethod: currentRow.paymentMethod,
    reference: currentRow.reference || "",
    notes: currentRow.notes || "",
    paidAt: currentRow.paidAt ? new Date(currentRow.paidAt) : new Date(),
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updatePayment,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["list-payments"] });
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
      toast.success("Payment updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update payment");
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    updateMutation.mutate({
      id: currentRow.id,
      payment: {
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        reference: values.reference,
        notes: values.notes,
        paidAt: values.paidAt,
      },
    });
  };

  const isPending = updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update the payment details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Show order info */}
        <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order #:</span>
            <span className="font-mono font-medium">{currentRow.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{currentRow.customer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Total:</span>
            <span className="font-medium">
              ৳
              {currentRow.order?.grandTotal?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ৳
              {currentRow.order?.totalPaid?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Amount:</span>
            <span
              className={`font-semibold ${
                (currentRow.order?.grandTotal ?? 0)
                - (currentRow.order?.totalPaid ?? 0)
                > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              ৳
              {Math.max(
                0,
                (currentRow.order?.grandTotal ?? 0)
                - (currentRow.order?.totalPaid ?? 0),
              ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="payments-form"
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
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7"
                          {...field}
                          value={field.value || ""}
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
          <Button type="submit" form="payments-form" disabled={isPending}>
            {isPending ? "Saving..." : "Update Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
