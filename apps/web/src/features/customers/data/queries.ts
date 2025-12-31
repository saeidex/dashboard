import type { insertCustomersSchema, patchCustomersSchema } from "@takumitex/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

// TODO: implement search

export const queryKeys = {
  LIST_CUSTOMERS: { queryKey: ["list-customers"] },
  LIST_CUSTOMER: (id: string) => ({ queryKey: [`list-customer-${id}`] }),
};

export const customersQueryOptions = queryOptions({
  ...queryKeys.LIST_CUSTOMERS,
  queryFn: async () => {
    const response = await apiClient.api.customers.$get();
    return response.json();
  },
});

export function createCustomerQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_CUSTOMER(id),
    queryFn: async () => {
      const response = await apiClient.api.customers[":id"].$get({
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

export async function createCustomer(customer: insertCustomersSchema) {
  const response = await apiClient.api.customers.$post({
    json: customer,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteCustomer(id: string) {
  const response = await apiClient.api.customers[":id"].$delete({
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

export async function updateCustomer({ id, customer }: { id: string; customer: patchCustomersSchema }) {
  const response = await apiClient.api.customers[":id"].$patch({
    param: {
      id,
    },
    json: customer,
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
