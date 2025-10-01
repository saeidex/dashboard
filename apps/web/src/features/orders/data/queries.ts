import type { insertOrderWithItemsSchema, patchOrderWithItemsSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_ORDERS: { queryKey: ["list-orders"] },
  LIST_ORDER : (id: string) => ({ queryKey: [`list-order-${id}`] }),
};

export const ordersQueryOptions = queryOptions({
  ...queryKeys.LIST_ORDERS,
  queryFn: async () => {
    const response = await apiClient.api.orders.$get();
    return response.json();
  },
});

export function createOrderQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_ORDER(id),
    queryFn: async () => {
      const response = await apiClient.api.orders[":id"].$get({
        param: { id },
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

export async function createOrder(order: insertOrderWithItemsSchema) {
  const response = await apiClient.api.orders.$post({
    json: order,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteOrder(id: string) {
  const response = await apiClient.api.orders[":id"].$delete({
    param: { id },
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

export async function updateOrder({ id, order }: { id: string; order: patchOrderWithItemsSchema }) {
  const response = await apiClient.api.orders[":id"].$patch({
    param: { id },
    json : order,
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
