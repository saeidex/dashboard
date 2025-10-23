import { useQuery } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const response = await apiClient.api.onboarding.status.$get();

      if (!response.ok) {
        throw new Error("Failed to check onboarding status");
      }

      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
