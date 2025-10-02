import type { insertExpensesSchema, patchExpensesSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_EXPENSES: { queryKey: ["list-expenses"] },
  LIST_EXPENSE: (id: string) => ({ queryKey: [`list-expense-${id}`] }),
};

export const expensesQueryOptions = queryOptions({
  ...queryKeys.LIST_EXPENSES,
  queryFn: async () => {
    const response = await apiClient.api.expenses.$get();
    return response.json();
  },
});

export function createExpenseQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_EXPENSE(id),
    queryFn: async () => {
      const response = await apiClient.api.expenses[":id"].$get({
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

export async function createExpense(expense: insertExpensesSchema) {
  const response = await apiClient.api.expenses.$post({
    json: expense,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteExpense(id: string) {
  const response = await apiClient.api.expenses[":id"].$delete({
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

export async function updateExpense({ id, expense }: { id: string; expense: patchExpensesSchema }) {
  const response = await apiClient.api.expenses[":id"].$patch({
    param: {
      id,
    },
    json: expense,
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
