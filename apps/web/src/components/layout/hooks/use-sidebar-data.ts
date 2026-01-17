import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { customersQueryOptions } from "@/web/features/customers/data/queries";

import type { NavGroup, NavItem, SidebarData } from "../types";

import { sidebarData as staticSidebarData } from "../data/sidebar-data";

/**
 * Hook that returns sidebar data with dynamic customer items under Orders
 */
export function useSidebarData(): SidebarData & { isLoading: boolean } {
  const { data: customers, isLoading } = useQuery({
    ...customersQueryOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const dynamicNavGroups = useMemo((): NavGroup[] => {
    return staticSidebarData.navGroups.map((group) => {
      if (group.title !== "General") {
        return group;
      }

      // Transform the Orders item to have customer sub-items
      const transformedItems: NavItem[] = group.items.map((item) => {
        if (item.title !== "Orders") {
          return item;
        }

        // Sort customers alphabetically by name
        const sortedCustomers = customers
          ? [...customers].sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
            )
          : [];

        // If no customers loaded yet, keep as simple link
        if (sortedCustomers.length === 0) {
          return item;
        }

        // Transform Orders into a collapsible with customer sub-items
        return {
          title: "Orders",
          icon: item.icon,
          items: [
            {
              title: "All Orders",
              url: "/orders" as const,
            },
            ...sortedCustomers.map(customer => ({
              title: customer.name,
              url: `/orders/${customer.id}` as const,
            })),
          ],
        };
      });

      return {
        ...group,
        items: transformedItems,
      };
    });
  }, [customers]);

  return {
    ...staticSidebarData,
    navGroups: dynamicNavGroups,
    isLoading,
  };
}
