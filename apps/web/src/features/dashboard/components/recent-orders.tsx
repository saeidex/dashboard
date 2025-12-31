import type { PaymentStatus } from "@takumitex/api/schema";

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { paymentStatusValues } from "@/web/features/orders/data/data";

import { customersQueryOptions } from "../../customers/data/queries";
import { createOrdersQueryOptions } from "../../orders/data/queries";

type RecentOrdersProps = {
  limit?: number;
  type?: "all" | PaymentStatus | "sales";
};

export function RecentOrders({ limit = 6, type }: RecentOrdersProps) {
  const { data: { rows: orders } } = useSuspenseQuery(
    {
      ...createOrdersQueryOptions({ pageIndex: 0, pageSize: 1000 }),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  );
  const { data: customers } = useSuspenseQuery(customersQueryOptions);

  const recent = useMemo(() => {
    let recentOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );

    if (type === "sales") {
      recentOrders = recentOrders.filter(
        o => o.paymentStatus === "paid" || o.paymentStatus === "partial",
      );
    }
    else if (paymentStatusValues.includes(type as PaymentStatus)) {
      recentOrders = recentOrders.filter(o => o.paymentStatus === type);
    }
    else {
      recentOrders = recentOrders.filter(
        o => o.paymentStatus === "paid" || o.paymentStatus === "partial",
      );
    }

    return recentOrders.slice(0, limit).map((o) => {
      const customer = customers.find(v => v.id === o.customerId);
      return {
        id: o.id,
        name: customer?.name ?? "Unknown Customer",
        email: customer?.email ?? "unknown@example.com",
        total: o.grandTotal,
      };
    });
  }, [limit, type, customers, orders]);

  return (
    <div className="space-y-6">
      {recent.map((r) => {
        const tokens = r.name.match(/[A-Z0-9]+/gi) || [];
        const initials = (
          tokens
            .slice(0, 2)
            .map(t => t[0])
            .join("") || "?"
        ).toUpperCase();

        return (
          <div key={r.id} className="flex items-center gap-4">
            <Avatar className="bg-muted flex h-9 w-9 items-center justify-center rounded-full border">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-wrap items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm leading-none font-medium">{r.name}</p>
                <p className="text-muted-foreground text-xs">{r.email}</p>
              </div>
              <div className="font-medium tabular-nums">
                +৳
                {r.total.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        );
      })}
      {recent.length === 0 && (
        <p className="text-muted-foreground text-sm">No recent sales.</p>
      )}
    </div>
  );
}
