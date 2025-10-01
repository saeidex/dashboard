"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordInput } from "@/web/components/password-input";
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

import type { User } from "../data/schema";

import { roles } from "../data/data";
import { createUser, queryKeys, updateUser } from "../data/queries";

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z.email({
      error: iss => (iss.input === "" ? "Email is required." : undefined),
    }),
    image: z.string().optional().nullable(),
    password: z.string().transform(pwd => pwd.trim()),
    confirmPassword: z.string().transform(pwd => pwd.trim()),
    role: z.literal("user").or(z.literal("admin")),
    isEdit: z.boolean(),
  })
  .refine(
    ({ image }) => {
      if (image === null || image === undefined || image === "")
        return true;
      return z.url().safeParse(image).success;
    },
    {
      message: "Image must be a valid URL.",
      path: ["image"],
    },
  )
  .refine(
    (data) => {
      if (data.isEdit && !data.password)
        return true;
      return data.password.length > 0;
    },
    {
      message: "Password is required.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password)
        return true;
      return password.length >= 8;
    },
    {
      message: "Password must be at least 8 characters long.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password)
        return true;
      return /[a-z]/.test(password);
    },
    {
      message: "Password must contain at least one lowercase letter.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password)
        return true;
      return /\d/.test(password);
    },
    {
      message: "Password must contain at least one number.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password)
        return true;
      return password === confirmPassword;
    },
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    },
  );
type UserForm = z.infer<typeof formSchema>;

type UserActionDialogProps = {
  currentRow?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          role: currentRow.role as "admin" | "user" | undefined,
          password: "",
          confirmPassword: "",
          image: currentRow.image ?? null,
          isEdit,
        }
      : {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user" as const,
          image: null,
          isEdit,
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_USERS);
      onOpenChange(false);
      toast.success("User created successfully.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_USERS);
      onOpenChange(false);
      toast.success("User updated successfully.");
    },
  });

  const onSubmit = (values: UserForm) => {
    if (isEdit) {
      const { confirmPassword, isEdit, ...payload } = values;
      updateMutation.mutate({ id: currentRow.id, payload });
    }
    else {
      createMutation.mutate(values);
    }
  };

  const isPasswordTouched = !!form.formState.dirtyFields.password;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hazrat Ali"
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
                        placeholder="hazrat.ali@gmail.com"
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
                name="image"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Image URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.png"
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
                name="role"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select a role"
                      className="col-span-4"
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {
                !isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="e.g., S3cur3P@ssw0rd"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                )
              }

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                      <FormLabel className="col-span-2 text-end">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          disabled={!isPasswordTouched}
                          placeholder="e.g., S3cur3P@ssw0rd"
                          className="col-span-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="col-span-4 col-start-3" />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
