import type { insertProductSizesSchema, patchProductSizesSchema } from "@takumitex/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_DIMENSIONS: { queryKey: ["list-sizes"] },
  LIST_DIMENSION: (id: number) => ({ queryKey: [`list-size-${id}`] }),
};

export const sizesQueryOptions = queryOptions({
  ...queryKeys.LIST_DIMENSIONS,
  queryFn: async () => {
    const response = await apiClient.api.sizes.$get();
    return response.json();
  },
});

export function createSizeQueryOptions(id: number) {
  return queryOptions({
    ...queryKeys.LIST_DIMENSION(id),
    queryFn: async () => {
      const response = await apiClient.api.sizes[":id"].$get({
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

export async function createSize(size: insertProductSizesSchema) {
  const response = await apiClient.api.sizes.$post({
    json: size,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteSize(id: number) {
  const response = await apiClient.api.sizes[":id"].$delete({
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

export async function updateSize({ id, size }: { id: number; size: patchProductSizesSchema }) {
  const response = await apiClient.api.sizes[":id"].$patch({
    param: {
      id,
    },
    json: size,
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
