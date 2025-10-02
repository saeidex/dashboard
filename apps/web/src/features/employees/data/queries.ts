import type { insertEmployeesSchema, patchEmployeesSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_EMPLOYEES: { queryKey: ["list-employees"] },
  LIST_EMPLOYEE: (id: string) => ({ queryKey: [`list-employee-${id}`] }),
};

export const employeesQueryOptions = queryOptions({
  ...queryKeys.LIST_EMPLOYEES,
  queryFn: async () => {
    const response = await apiClient.api.employees.$get();
    return response.json();
  },
});

export function createEmployeeQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_EMPLOYEE(id),
    queryFn: async () => {
      const response = await apiClient.api.employees[":id"].$get({
        param: {
          id,
        },
      });
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      if ("success" in json) {
        const message = formatApiError(json);
        throw new Error(message);
      }
      return json;
    },
  });
}

export async function createEmployee(employee: insertEmployeesSchema) {
  const response = await apiClient.api.employees.$post({
    json: employee,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteEmployee(id: string) {
  const response = await apiClient.api.employees[":id"].$delete({
    param: {
      id,
    },
  });
  if (response.status !== 204) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
}

export async function updateEmployee({ id, employee }: { id: string; employee: patchEmployeesSchema }) {
  const response = await apiClient.api.employees[":id"].$patch({
    param: {
      id,
    },
    json: employee,
  });
  if (response.status !== 200) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
}
