"use client";

import { insertProductSizesSchema } from "@crm/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

import type { Size } from "../data/schema";

import { createSize, queryKeys, updateSize } from "../data/queries";

type SizeActionDialogProps = {
  currentRow?: Size;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SizesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: SizeActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertProductSizesSchema>({
    resolver: zodResolver(insertProductSizesSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          unit: "MM",
          description: "",
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createSize,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success(`Size created successfully`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSize,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success(`Size updated successfully`);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "Edit Size" : "Add New Size"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the size here. "
              : "Create new size here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-fit w-[calc(100%+0.75rem)] max-h-[60vh] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="size-form"
              onSubmit={form.handleSubmit((data) => {
                isEdit
                  ? updateMutation.mutate({ id: currentRow.id, size: data })
                  : createMutation.mutate(data);
              })}
              className="space-y-4 px-0.5"
            >
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step={0.01}
                          value={field.value ?? 0}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step={0.01}
                          value={field.value ?? 0}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step={0.01}
                          value={field.value ?? 0}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="M" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Optional description"
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
          <Button
            type="submit"
            form="size-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
