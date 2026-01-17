import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";

export const recentAuditLogsQueryOptions = (limit = 10) =>
  queryOptions({
    queryKey: ["audit-logs", "recent", limit],
    queryFn: async () => {
      const response = await apiClient.api["audit-logs"].recent.$get({
        query: { limit: limit.toString() },
      });
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

export const auditLogsQueryOptions = (params?: {
  limit?: number;
  offset?: number;
  orderId?: number;
  entityType?: string;
}) =>
  queryOptions({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await apiClient.api["audit-logs"].$get({
        query: {
          limit: params?.limit?.toString(),
          offset: params?.offset?.toString(),
          orderId: params?.orderId?.toString(),
          entityType: params?.entityType,
        },
      });
      return response.json();
    },
    staleTime: 30 * 1000,
  });
