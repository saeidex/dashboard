import type { insertEmployeesSchema, selectEmployeesSchema } from "@crm/api/schema";

export type Employee = insertEmployeesSchema | selectEmployeesSchema;
