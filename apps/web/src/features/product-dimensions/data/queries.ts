import type { insertProductDimensionsSchema, patchProductDimensionsSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_DIMENSIONS: { queryKey: ["list-dimensions"] },
  LIST_DIMENSION: (id: number) => ({ queryKey: [`list-dimension-${id}`] }),
};

export const dimensionsQueryOptions = queryOptions({
  ...queryKeys.LIST_DIMENSIONS,
  queryFn: async () => {
    const response = await apiClient.api.dimensions.$get();
    return response.json();
  },
});

export function createDimensionQueryOptions(id: number) {
  return queryOptions({
    ...queryKeys.LIST_DIMENSION(id),
    queryFn: async () => {
      const response = await apiClient.api.dimensions[":id"].$get({
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

export async function createDimension(dimension: insertProductDimensionsSchema) {
  const response = await apiClient.api.dimensions.$post({
    json: dimension,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteDimension(id: number) {
  const response = await apiClient.api.dimensions[":id"].$delete({
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

export async function updateDimension({ id, dimension }: { id: number; dimension: patchProductDimensionsSchema }) {
  const response = await apiClient.api.dimensions[":id"].$patch({
    param: {
      id,
    },
    json: dimension,
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
