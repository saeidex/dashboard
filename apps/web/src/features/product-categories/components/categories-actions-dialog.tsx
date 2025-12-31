"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductCategoriesSchema } from "@takumitex/api/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
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

import type { Category } from "../data/schema";

import { createCategory, queryKeys, updateCategory } from "../data/queries";

type CategoryActionDialogProps = {
  currentRow?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CategoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CategoryActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<insertProductCategoriesSchema>({
    resolver: zodResolver(insertProductCategoriesSchema),
    defaultValues: isEdit
      ? currentRow
      : {
          name: "",
          description: "",
          image: "",
        },
  });

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          form.resetField("image");
          return;
        }

        form.setValue("image", reader.result);
        form.clearErrors("image");
      };

      reader.onerror = () => {
        form.resetField("image");
      };

      try {
        reader.readAsDataURL(acceptedFiles[0]);
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        form.resetField("image");
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections }
    = useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 1000000,
      accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
    });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_CATEGORIES);
      toast.success(`Category created successfully`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_CATEGORIES);
      toast.success(`Category updated successfully`);
    },
  });

  const imageValue = form.watch("image");
  const preview = typeof imageValue === "string" ? imageValue : null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category here. "
              : "Create new category here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-fit w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="category-form"
              onSubmit={form.handleSubmit((data) => {
                isEdit
                  ? updateMutation.mutate({ id: currentRow.id, category: data })
                  : createMutation.mutate(data);
              })}
              className="space-y-4 px-0.5"
            >
              {isEdit && (
                <FormField
                  name="id"
                  render={() => (
                    <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                      <FormLabel className="col-span-2 text-end">ID</FormLabel>
                      <FormControl>
                        <div className="col-span-4">
                          <span className="block rounded-md border border-dashed border-muted-foreground/40 bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground">
                            {currentRow?.id}
                          </span>
                        </div>
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
                        placeholder="Electronics"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description..."
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
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel
                      className={`${
                        fileRejections.length !== 0 && "text-destructive"
                      }`}
                    >
                      <h2 className="text-xl font-semibold tracking-tight">
                        Upload your image
                        <span
                          className={
                            form.formState.errors.image || fileRejections.length !== 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                        </span>
                      </h2>
                    </FormLabel>
                    <FormControl>
                      <div
                        {...getRootProps()}
                        className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-foreground p-4 shadow-sm shadow-foreground"
                      >
                        {preview && (
                          <img
                            src={preview}
                            alt="Uploaded image"
                            className="max-h-[400px]"
                          />
                        )}
                        <ImagePlus
                          className={`size-40 ${preview ? "hidden" : "block"}`}
                        />
                        <Input {...getInputProps()} type="file" />
                        {isDragActive
                          ? (
                              <p>Drop the image!</p>
                            )
                          : (
                              <p>Click here or drag an image to upload it</p>
                            )}
                      </div>
                    </FormControl>
                    <FormMessage>
                      {fileRejections.length !== 0 && (
                        <p>
                          Image must be less than 1MB and of type png, jpg, or jpeg
                        </p>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
            }}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="category-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
