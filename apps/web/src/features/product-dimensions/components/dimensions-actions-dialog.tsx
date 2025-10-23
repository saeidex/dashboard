"use client";

import { insertProductDimensionsSchema } from "@crm/api/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import { Textarea } from "@/web/components/ui/textarea";

import type { Dimension } from "../data/schema";

import { createDimension, queryKeys, updateDimension } from "../data/queries";

type DimensionActionDialogProps = {
  currentRow?: Dimension;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DimensionsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: DimensionActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertProductDimensionsSchema>({
    resolver: zodResolver(insertProductDimensionsSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          length: 0,
          width: 0,
          height: 0,
          unit: "MM",
          description: "",
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createDimension,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success(`Dimension created successfully`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDimension,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success(`Dimension updated successfully`);
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
            {isEdit ? "Edit Dimension" : "Add New Dimension"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the dimension here. "
              : "Create new dimension here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-fit w-[calc(100%+0.75rem)] max-h-[60vh] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="dimension-form"
              onSubmit={form.handleSubmit((data) => {
                isEdit
                  ? updateMutation.mutate({ id: currentRow.id, dimension: data })
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
                      <FormLabel>Length *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={e => field.onChange(Number.parseFloat(e.target.value))}
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
                      <FormLabel>Width *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={e => field.onChange(Number.parseFloat(e.target.value))}
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
                      <FormLabel>Height *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={e => field.onChange(Number.parseFloat(e.target.value))}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MM">MM (Millimeter)</SelectItem>
                        <SelectItem value="CM">CM (Centimeter)</SelectItem>
                        <SelectItem value="M">M (Meter)</SelectItem>
                        <SelectItem value="IN">IN (Inch)</SelectItem>
                        <SelectItem value="FT">FT (Feet)</SelectItem>
                      </SelectContent>
                    </Select>
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
            form="dimension-form"
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
