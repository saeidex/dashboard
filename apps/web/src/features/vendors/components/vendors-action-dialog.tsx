"use client";

import { insertVendorsSchema } from "@crm/api/schema";
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

import type { Vendor } from "../data/schema";

import { createVendor, queryKeys, updateVendor } from "../data/queries";

type VendorActionDialogProps = {
  currentRow?: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const activeStatuses = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export function VendorsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: VendorActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertVendorsSchema>({
    resolver: zodResolver(insertVendorsSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          vendorId: `VND-${Math.floor(10000 + Math.random() * 90000)}`,
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
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_VENDORS);
      toast.success("Vendor created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateVendor,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_VENDORS);
      toast.success("Vendor updated successfully");
    },
  });

  const onSubmit = (values: insertVendorsSchema) => {
    form.reset();

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, vendor: values });
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
          <DialogTitle>{isEdit ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the vendor here. " : "Create new vendor here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-auto w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="vendor-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="vendorId"
                disabled={isEdit}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Vendor ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vendor ID"
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
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vendor Name"
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
                        placeholder="vendor@company.com"
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
            form="vendor-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
