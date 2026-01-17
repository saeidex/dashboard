"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { insertFactoriesSchema } from "@takumitex/api/schema";
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
import { Textarea } from "@/web/components/ui/textarea";

import type { Factory } from "../data/schema";

import { createFactory, queryKeys, updateFactory } from "../data/queries";

type FactoryActionDialogProps = {
  currentRow?: Factory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

export function FactoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: FactoryActionDialogProps) {
  const isEdit = !!currentRow;

  const getDefaultValues = (): insertFactoriesSchema => {
    if (isEdit && currentRow) {
      return {
        name: currentRow.name,
        code: currentRow.code,
        address: currentRow.address ?? "",
        city: currentRow.city ?? "",
        country: currentRow.country ?? "Bangladesh",
        contactPerson: currentRow.contactPerson ?? "",
        phone: currentRow.phone ?? "",
        email: currentRow.email ?? "",
        capacity: currentRow.capacity ?? 0,
        totalLines: currentRow.totalLines ?? 0,
        maxManpower: currentRow.maxManpower ?? 0,
        status: currentRow.status ?? "active",
        notes: currentRow.notes ?? "",
      };
    }
    return {
      name: "",
      code: "",
      address: "",
      city: "",
      country: "Bangladesh",
      contactPerson: "",
      phone: "",
      email: "",
      capacity: 0,
      totalLines: 0,
      maxManpower: 0,
      status: "active",
      notes: "",
    };
  };

  const form = useForm<insertFactoriesSchema>({
    resolver: zodResolver(insertFactoriesSchema),
    defaultValues: getDefaultValues(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createFactory,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_FACTORIES);
      toast.success("Factory created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFactory,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_FACTORIES);
      toast.success("Factory updated successfully");
    },
  });

  const onSubmit = (values: insertFactoriesSchema) => {
    form.reset();

    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, factory: values });
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "Edit Factory" : "Add New Factory"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the factory details. " : "Add a new factory. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-auto w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="factory-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Factory Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., RAJ-01"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Factory Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Rajdhani Apparels"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact person name"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+880..."
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="factory@example.com"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Factory address"
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Gazipur"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Bangladesh"
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="totalLines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Lines</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          value={field.value ?? 0}
                          onChange={e =>
                            field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxManpower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Manpower</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          value={field.value ?? 0}
                          onChange={e =>
                            field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (pcs/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          value={field.value ?? 0}
                          onChange={e =>
                            field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select status"
                      items={statusOptions}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the factory"
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="factory-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
