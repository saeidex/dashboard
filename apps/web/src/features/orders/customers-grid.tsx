import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Crown, Medal, Sparkles, Star, User } from "lucide-react";
import { useMemo } from "react";

import type { CustomerTier } from "@/web/lib/customer-ranking";

import { Badge } from "@/web/components/ui/badge";
import { Card, CardContent } from "@/web/components/ui/card";
import {
  calculateTierThresholds,

  getCustomerRanking,
} from "@/web/lib/customer-ranking";
import { cn } from "@/web/lib/utils";

import { customersQueryOptions } from "../customers/data/queries";

const TierIcon: Record<CustomerTier, typeof Crown> = {
  platinum: Crown,
  gold: Star,
  silver: Medal,
  bronze: Sparkles,
  new: User,
};

export function CustomersGrid() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions);

  // Calculate tier thresholds based on order counts
  const thresholds = useMemo(() => {
    const orderCounts = customers?.map(c => c.orderCount ?? 0) ?? [];
    return calculateTierThresholds(orderCounts);
  }, [customers]);

  // Sort customers by order count (descending), then alphabetically
  const sortedCustomers = useMemo(() => {
    if (!customers)
      return [];
    return [...customers].sort((a, b) => {
      const orderDiff = (b.orderCount ?? 0) - (a.orderCount ?? 0);
      if (orderDiff !== 0)
        return orderDiff;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [customers]);

  if (!sortedCustomers || sortedCustomers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {sortedCustomers.map((customer) => {
        const ranking = getCustomerRanking(customer.orderCount ?? 0, thresholds);
        const Icon = TierIcon[ranking.tier];

        return (
          <Link to="/orders/$customerId" params={{ customerId: customer.id }} key={customer.id}>
            <Card className={cn("cursor-pointer transition-colors hover:bg-muted/50", ranking.borderClass)}>
              <CardContent className="flex flex-1 items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Icon className={cn("size-4 shrink-0", ranking.textClass)} />
                  <span className={cn("line-clamp-1", ranking.textClass)}>{customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("shrink-0 text-xs", ranking.bgClass, ranking.textClass)}>
                    {customer.orderCount ?? 0}
                    {" "}
                    orders
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
