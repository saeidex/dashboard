import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Crown, Medal, Search, Sparkles, Star, User, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { CustomerTier } from "@/web/lib/customer-ranking";

import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { Card, CardContent } from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import {
  calculateTierThresholds,

  getCustomerRanking,
  getRankingByTier,
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

const TIER_OPTIONS: { value: CustomerTier | "all"; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "new", label: "New" },
];

export function CustomersGrid() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "all">("all");

  // Calculate tier thresholds based on order counts
  const thresholds = useMemo(() => {
    const orderCounts = customers?.map(c => c.orderCount ?? 0) ?? [];
    return calculateTierThresholds(orderCounts);
  }, [customers]);

  // Sort and filter customers
  const filteredCustomers = useMemo(() => {
    if (!customers)
      return [];

    return [...customers]
      .filter((customer) => {
        // Search filter
        const matchesSearch = searchQuery === ""
          || customer.name.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.phone?.includes(searchQuery);

        // Tier filter
        if (tierFilter === "all")
          return matchesSearch;

        const customerTier = getCustomerRanking(customer.orderCount ?? 0, thresholds).tier;
        return matchesSearch && customerTier === tierFilter;
      })
      .sort((a, b) => {
        const orderDiff = (b.orderCount ?? 0) - (a.orderCount ?? 0);
        if (orderDiff !== 0)
          return orderDiff;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
  }, [customers, searchQuery, tierFilter, thresholds]);

  const isFiltered = searchQuery !== "" || tierFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setTierFilter("all");
  };

  if (!customers || customers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-8 sm:w-[250px]"
            />
          </div>
          <Select value={tierFilter} onValueChange={value => setTierFilter(value as CustomerTier | "all")}>
            <SelectTrigger className="h-9 w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              {TIER_OPTIONS.map((option) => {
                const ranking = option.value !== "all" ? getRankingByTier(option.value) : null;
                const Icon = option.value !== "all" ? TierIcon[option.value] : null;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={cn("flex items-center gap-2", ranking?.textClass)}>
                      {Icon && <Icon className="size-4" />}
                      {option.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button variant="ghost" onClick={clearFilters} className="h-9 px-2 lg:px-3">
              Reset
              <X className="ml-2 size-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length}
          {" "}
          of
          {" "}
          {customers.length}
          {" "}
          customers
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0
        ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">No customers found.</p>
            </div>
          )
        : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCustomers.map((customer) => {
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
          )}
    </div>
  );
}
