import type { insertProductsSchema, patchProductsSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import type { ProductSearch } from "@/web/routes/_authenticated/products";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_PRODUCTS: (query: ProductSearch) => ({ queryKey: ["list-products", query] }),
  LIST_PRODUCT: (id: string) => ({ queryKey: [`list-product-${id}`] }),
};

export const createProductsQueryOptions = (query: ProductSearch = {}) => queryOptions({
  ...queryKeys.LIST_PRODUCTS(query),
  queryFn: async () => {
    const response = await apiClient.api.products.$get({
      query,
    });

    const json = await response.json();

    if ("success" in json) {
      const message = formatApiError(json);
      throw new Error(message);
    }

    return json;
  },
});

export function createProductQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_PRODUCT(id),
    queryFn: async () => {
      const response = await apiClient.api.products[":id"].$get({
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

export async function createProduct(product: insertProductsSchema) {
  const response = await apiClient.api.products.$post({
    json: product,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteProduct(id: string) {
  const response = await apiClient.api.products[":id"].$delete({
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

export async function updateProduct({ id, product }: { id: string; product: patchProductsSchema }) {
  const response = await apiClient.api.products[":id"].$patch({
    param: {
      id,
    },
    json: product,
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
