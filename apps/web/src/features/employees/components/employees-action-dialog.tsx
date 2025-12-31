"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeesSchema } from "@takumitex/api/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { SelectDropdown } from "@/web/components/select-dropdown";
import { Button } from "@/web/components/ui/button";
import { Calendar } from "@/web/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/web/components/ui/popover";
import { cn } from "@/web/lib/utils";

import type { Employee } from "../data/schema";

import { positions, shifts, statuses } from "../data/data";
import { createEmployee, queryKeys, updateEmployee } from "../data/queries";

type EmployeeActionDialogProps = {
  currentRow?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fromSchema = insertEmployeesSchema.extend({
  hireDate: z.date().optional(),
});

export function EmployeesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: EmployeeActionDialogProps) {
  const isEdit = !!currentRow;
  const form = useForm<z.infer<typeof fromSchema>>({
    resolver: zodResolver(fromSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          hireDate: new Date(currentRow.hireDate),
        }
      : {
          firstName: "",
          lastName: "",
          employeeId: "EMP-1001",
          email: "",
          phoneNumber: "",
          position: "Helper",
          shift: "Day",
          salary: 10000,
          status: "active",
          hireDate: new Date(),
        },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_EMPLOYEES);
    },
    onMutate(employee) {
      const employeeId = employee.employeeId;

      const existingEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.LIST_EMPLOYEES.queryKey,
      );

      const existingEmployeeId = existingEmployees?.find(e => e.employeeId === employeeId);
      if (existingEmployeeId) {
        form.setError("employeeId", { type: "manual", message: "Employee ID must be unique" });
        throw new Error("Employee ID must be unique");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries(queryKeys.LIST_EMPLOYEES);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the employee here. "
              : "Create new employee here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="employee-form"
              onSubmit={form.handleSubmit((data) => {
                if (isEdit && currentRow) {
                  updateMutation.mutate({ id: currentRow.id, employee: data });
                }
                else {
                  const hireDate = data.hireDate ?? new Date();
                  createMutation.mutate({ ...data, hireDate });
                }
              })}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hazrat"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ali"
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
                name="employeeId"
                disabled={isEdit}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Employee ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EMP-1001"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="employee@company.com"
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Phone Number
                    </FormLabel>
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
                name="position"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Position
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select position"
                      className="col-span-4"
                      items={positions}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Shift</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select shift"
                      className="col-span-4"
                      items={shifts}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Salary
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        step={100}
                        min={0}
                        {...field}
                        className="col-span-4"
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Status
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select status"
                      className="col-span-4"
                      items={statuses}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Hire Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? (
                                  format(field.value, "PPP")
                                )
                              : (
                                  <span>Pick a date</span>
                                )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={date => date && field.onChange(date)}
                          disabled={date =>
                            date > new Date() || date < new Date("1900-01-01")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            form="employee-form"
            disabled={createMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
