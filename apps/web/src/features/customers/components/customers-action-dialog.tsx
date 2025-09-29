"use client";

import { insertCustomersSchema } from "@crm/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
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

import type { Customer } from "../data/schema";

import { createCustomer, queryKeys, updateCustomer } from "../data/queries";

type CustomerActionDialogProps = {
  currentRow?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const activeStatuses = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function CustomersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CustomerActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertCustomersSchema>({
    resolver: zodResolver(insertCustomersSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          notes: "",
          isActive: true,
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_CUSTOMERS);
      toast.success("Customer created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_CUSTOMERS);
      toast.success("Customer updated successfully");
    },
  });

  const onSubmit = (values: insertCustomersSchema) => {
    form.reset();

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, customer: values });
    }
    else {
      createMutation.mutate(values);
    }

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the customer here. " : "Create new customer here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="customer-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              {isEdit
                && (
                  <FormField
                    name="id"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">Customer ID</FormLabel>
                        <FormControl>
                          <span className="col-span-4 select-all rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            {field.value}
                          </span>
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer Name"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="customer@company.com"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+123456789"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street Address"
                        className="col-span-4"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        className="col-span-4"
                        {...field}
                        value={field.value ?? ""}
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
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Status
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ? "true" : "false"}
                      onValueChange={value =>
                        field.onChange(value === "true")}
                      placeholder="Select status"
                      className="col-span-4"
                      items={activeStatuses}
                    />
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
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="customer-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
