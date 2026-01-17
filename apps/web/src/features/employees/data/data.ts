import type { EmployeeStatus, Position, Shift } from "@takumitex/api/schema";

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
  label: Capitalize<Position>;
  value: Position;
}[] = [
  { label: "Sourcing Manager", value: "Sourcing Manager" },
  { label: "Merchandiser", value: "Merchandiser" },
  { label: "Quality Assurance Manager", value: "Quality Assurance Manager" },
  { label: "Sample Coordinator", value: "Sample Coordinator" },
  { label: "Logistics Coordinator", value: "Logistics Coordinator" },
  { label: "Fabric Technologist", value: "Fabric Technologist" },
  { label: "Compliance Officer", value: "Compliance Officer" },
  { label: "Production Planner", value: "Production Planner" },
  { label: "Pattern Master", value: "Pattern Master" },
  { label: "Supply Chain Executive", value: "Supply Chain Executive" },
];

export const shifts: { label: Capitalize<Shift>; value: Shift }[] = [
  { label: "Day", value: "Day" },
  { label: "Evening", value: "Evening" },
  { label: "Night", value: "Night" },
];

export const statuses: { label: Capitalize<string>; value: EmployeeStatus }[]
  = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "On Leave", value: "on-leave" },
    { label: "Terminated", value: "terminated" },
  ];
