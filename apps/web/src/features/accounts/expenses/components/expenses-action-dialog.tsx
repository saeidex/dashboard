"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EXPENSE_CATEGORIES, insertExpensesSchema } from "@takumitex/api/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { Input } from "@/web/components/ui/input";

import type { Expense } from "../data/schema";

import { createExpense, queryKeys, updateExpense } from "../data/queries";

type ExpenseActionDialogProps = {
  currentRow?: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExpensesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ExpenseActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertExpensesSchema>({
    resolver: zodResolver(insertExpensesSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          title: "",
          category: "other",
          amount: 0,
          currency: "BDT",
          notes: "",
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_EXPENSES);
      toast.success("Expense created successfully");
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_EXPENSES);
      toast.success("Expense updated successfully");
      onOpenChange(false);
    },
  });

  const onSubmit = (values: insertExpensesSchema) => {
    if (isEdit) {
      updateMutation.mutate({ id: currentRow.id, expense: values });
    }
    else {
      createMutation.mutate(values);
    }
  };

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
          <DialogTitle>
            {isEdit ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the expenses here. " : "Create new expenses here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="expenses-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Expense Title"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Category
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select category"
                      className="col-span-4"
                      items={EXPENSE_CATEGORIES.map(cat => ({
                        label: cat
                          .replace("-", " ")
                          .replace(/\b\w/g, c => c.toUpperCase()),
                        value: cat,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="col-span-4"
                        {...field}
                        onChange={e =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
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
                        placeholder="Additional notes..."
                        className="col-span-4"
                        {...field}
                        value={field.value ?? ""}
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
            type="submit"
            form="expenses-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
