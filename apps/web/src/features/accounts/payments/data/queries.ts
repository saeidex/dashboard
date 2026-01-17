import type { insertPaymentsSchema, patchPaymentsSchema, paymentListQueryParamsSchema } from "@takumitex/api/schema";

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_PAYMENTS: (query: paymentListQueryParamsSchema = { pageIndex: 0, pageSize: 10 }) => ({ queryKey: ["list-payments", query] }),
  LIST_PAYMENT: (id: string) => ({ queryKey: [`list-payment-${id}`] }),
  ORDER_PAYMENTS: (orderId: number) => ({ queryKey: [`order-payments-${orderId}`] }),
  ORDER_PAYMENT_SUMMARY: (orderId: number) => ({ queryKey: [`order-payment-summary-${orderId}`] }),
};

export const createPaymentsQueryOptions = (query: paymentListQueryParamsSchema = { pageIndex: 0, pageSize: 10 }) => queryOptions({
  ...queryKeys.LIST_PAYMENTS(query),
  queryFn: async () => {
    const response = await apiClient.api.payments.$get({ query });
    return response.json();
  },
  placeholderData: keepPreviousData,
});

export function createPaymentQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_PAYMENT(id),
    queryFn: async () => {
      const response = await apiClient.api.payments[":id"].$get({
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

export function createOrderPaymentsQueryOptions(orderId: number) {
  return queryOptions({
    ...queryKeys.ORDER_PAYMENTS(orderId),
    queryFn: async () => {
      const response = await apiClient.api.payments.order[":orderId"].$get({
        param: { orderId: String(orderId) },
      });
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      return json;
    },
  });
}

export function createOrderPaymentSummaryQueryOptions(orderId: number) {
  return queryOptions({
    ...queryKeys.ORDER_PAYMENT_SUMMARY(orderId),
    queryFn: async () => {
      const response = await apiClient.api.payments.order[":orderId"].summary.$get({
        param: { orderId: String(orderId) },
      });
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      return json;
    },
  });
}

export async function createPayment(payment: insertPaymentsSchema) {
  const response = await apiClient.api.payments.$post({
    json: payment,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  if ("message" in json) {
    throw new Error(json.message);
  }
  return json;
}

export async function deletePayment(id: string) {
  const response = await apiClient.api.payments[":id"].$delete({
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

export async function updatePayment({ id, payment }: { id: string; payment: patchPaymentsSchema }) {
  const response = await apiClient.api.payments[":id"].$patch({
    param: { id },
    json: payment,
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
