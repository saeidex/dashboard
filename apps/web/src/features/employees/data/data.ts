import type { EmployeeStatus, Position, Shift } from "@crm/api/schema";

export const callTypes = new Map<EmployeeStatus, string>([
  ["active", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
  ["inactive", "bg-neutral-300/40 border-neutral-300"],
  ["on-leave", "bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300"],
  [
    "terminated",
    "bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10",
  ],
]);

export const positions: {
  label: string;
  value: Position;
}[] = [
  { label: "Commercial Manager", value: "Commercial Manager" },
  { label: "Manager", value: "Manager" },
  { label: "Production Manager", value: "Production Manager" },
  { label: "Corrugation Operator", value: "Corrugation Operator" },
  { label: "Crease Operator", value: "Crease Operator" },
  { label: "Pasting Operator", value: "Pasting Operator" },
  { label: "Printing Master", value: "Printing Master" },
  { label: "Stitching Operator", value: "Stitching Operator" },
  { label: "Flexo Operator", value: "Flexo Operator" },
  { label: "Cutting Man", value: "Cutting Man" },
  { label: "Delivery Man", value: "Delivery Man" },
  { label: "Helper", value: "Helper" },
];

export const shifts: { label: string; value: Shift }[] = [
  { label: "Day", value: "Day" },
  { label: "Evening", value: "Evening" },
  { label: "Night", value: "Night" },
];

export const statuses: { label: string; value: EmployeeStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "On Leave", value: "on-leave" },
  { label: "Terminated", value: "terminated" },
];
