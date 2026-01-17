import type {
  insertOrderWithItemsSchema,
  orderListQueryParamsSchema,
  patchOrderWithItemsSchema,
} from "@takumitex/api/schema";

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_ORDERS: (
    query: orderListQueryParamsSchema = { pageIndex: 0, pageSize: 10 },
  ) => ({ queryKey: ["list-orders", query] }),
  LIST_ORDER: (id: string) => ({ queryKey: [`list-order-${id}`] }),
};

export const createOrdersQueryOptions = (
  query: orderListQueryParamsSchema = { pageIndex: 0, pageSize: 10 },
) =>
  queryOptions({
    ...queryKeys.LIST_ORDERS(query),
    queryFn: async () => {
      const response = await apiClient.api.orders.$get({ query });
      return response.json();
    },
    placeholderData: keepPreviousData,
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

export async function updateOrder({
  id,
  order,
}: {
  id: string;
  order: patchOrderWithItemsSchema;
}) {
  const response = await apiClient.api.orders[":id"].$patch({
    param: { id },
    json: order,
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
