import type { LucideIcon } from "lucide-react";

import { format } from "date-fns";
import {
  BadgePercent,
  CreditCard,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Badge } from "@/web/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Separator } from "@/web/components/ui/separator";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-300",
  processing: "bg-sky-500/15 text-sky-600 border-sky-500/20 dark:text-sky-300",
  shipped: "bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-300",
  delivered: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-300",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  returned: "bg-purple-500/15 text-purple-600 border-purple-500/20 dark:text-purple-300",
  default: "bg-muted/60 text-muted-foreground border-muted/40",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-300",
  partial: "bg-sky-500/15 text-sky-600 border-sky-500/20 dark:text-sky-300",
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-300",
  refunded: "bg-purple-500/15 text-purple-600 border-purple-500/20 dark:text-purple-300",
  default: "bg-muted/60 text-muted-foreground border-muted/40",
};

const getCurrencySymbol = (currency: Order["currency"]) => (currency === "BDT" ? "৳" : currency);

const formatAmount = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return amountFormatter.format(Number.isFinite(numeric) ? numeric : 0);
};

const toTitleCase = (value: string) => value
  .split(/[-_\s]+/u)
  .filter(Boolean)
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const formatBadgeLabel = (value?: string | null) => (value ? toTitleCase(value) : undefined);

type OrderExpandedPanelProps = {
  order: Order;
};

type SummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  highlight?: boolean;
};

function SummaryCard({ icon: Icon, label, value, hint, accent, highlight }: SummaryCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-card/95 backdrop-blur transition hover:border-primary/40 hover:shadow-lg",
        accent,
        highlight && "border-primary/50 shadow-lg shadow-primary/10",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div className="space-y-1">
          <CardDescription className="text-[0.65rem] uppercase tracking-wide">
            {label}
          </CardDescription>
          <CardTitle className="text-xl font-semibold leading-tight">
            {value}
          </CardTitle>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      {hint && (
        <CardContent className="pt-3 text-xs text-muted-foreground">
          {hint}
        </CardContent>
      )}
    </Card>
  );
}

export function OrderExpandedPanel({ order }: OrderExpandedPanelProps) {
  const items = order.items ?? [];
  const currencySymbol = getCurrencySymbol(order.currency);
  const taxTotal = Number(order.tax ?? 0);
  const shippingTotal = Number(order.shipping ?? 0);
  const uniqueItemCount = items.length;
  const totalItemQuantity = items.reduce<number>((total, item) => total + Number(item.quantity ?? 0), 0);

  const orderStatusLabel = formatBadgeLabel(order.orderStatus);
  const paymentStatusLabel = formatBadgeLabel(order.paymentStatus);
  const paymentMethodLabel = formatBadgeLabel(order.paymentMethod);

  const createdAt = order.createdAt ? new Date(order.createdAt) : undefined;

  const summaryCards: SummaryCardProps[] = [
    {
      icon: ShoppingBag,
      label: "Subtotal",
      value: `${currencySymbol}${formatAmount(order.retailPrice)}`,
      hint: `${totalItemQuantity} item${totalItemQuantity === 1 ? "" : "s"} across ${uniqueItemCount} line${uniqueItemCount === 1 ? "" : "s"}`,
      accent: "bg-gradient-to-br from-primary/10 via-primary/0 to-transparent dark:from-primary/20",
    },
    {
      icon: BadgePercent,
      label: "Discounts",
      value: "No discounts",
      hint: "Full price order",
      accent: "bg-gradient-to-br from-amber-500/10 via-transparent to-transparent dark:from-amber-400/15",
    },
    {
      icon: Truck,
      label: "Tax & Shipping",
      value: `${currencySymbol}${formatAmount(taxTotal + shippingTotal)}`,
      hint: `${taxTotal > 0 ? `Tax ${currencySymbol}${formatAmount(taxTotal)}` : "Tax included"}${shippingTotal > 0 ? ` · Shipping ${currencySymbol}${formatAmount(shippingTotal)}` : ""}`,
      accent: "bg-gradient-to-br from-sky-500/10 via-transparent to-transparent dark:from-sky-400/15",
    },
    {
      icon: CreditCard,
      label: "Grand Total",
      value: `${currencySymbol}${formatAmount(order.grandTotal)}`,
      hint: paymentStatusLabel ? `Payment: ${paymentStatusLabel}` : undefined,
      accent: "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/25",
      highlight: true,
    },
  ] as const;

  return (
    <div className="space-y-6 text-sm">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background/95 to-background shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20 dark:bg-primary/15">
              Order #
              {order.id}
            </Badge>
            <div className="space-y-1">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {order.customer?.name ?? "Customer"}
              </p>
              <p className="text-xs text-muted-foreground">
                {createdAt
                  ? `Placed ${format(createdAt, "PPP")} · ${totalItemQuantity} item${totalItemQuantity === 1 ? "" : "s"}`
                  : `${totalItemQuantity} item${totalItemQuantity === 1 ? "" : "s"}`}
              </p>
              {order.customer?.email && (
                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
              )}
              {order.customer?.phone && (
                <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {orderStatusLabel && (
              <Badge
                className={cn(
                  "uppercase tracking-wide",
                  ORDER_STATUS_STYLES[String(order.orderStatus ?? "").toLowerCase()] ?? ORDER_STATUS_STYLES.default,
                )}
              >
                {orderStatusLabel}
              </Badge>
            )}
            {paymentStatusLabel && (
              <Badge
                className={cn(
                  "uppercase tracking-wide",
                  PAYMENT_STATUS_STYLES[String(order.paymentStatus ?? "").toLowerCase()] ?? PAYMENT_STATUS_STYLES.default,
                )}
              >
                {paymentStatusLabel}
              </Badge>
            )}
            {paymentMethodLabel && (
              <Badge variant="outline" className="uppercase tracking-wide">
                {paymentMethodLabel}
              </Badge>
            )}
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(card => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>
      </div>
      <div className="p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Line items</p>
            <p className="text-xs text-muted-foreground">
              {uniqueItemCount}
              {" "}
              unique line
              {uniqueItemCount === 1 ? "" : "s"}
            </p>
          </div>
          <Badge variant="outline" className="bg-muted/50 text-[0.7rem] uppercase tracking-wide">
            Total qty:
            {" "}
            {totalItemQuantity}
          </Badge>
        </div>

        {items.length > 0
          ? (
              <div className="grid sm:grid-cols-3 gap-2">
                {items.map((item, index) => {
                  const key = item.id ?? `${item.productId ?? "item"}-${index}`;
                  return (
                    <div
                      key={key}
                      className="group rounded-xl border border-border/40 bg-card/70 px-3 py-2.5 transition hover:border-primary/40"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <p className="font-semibold leading-tight text-foreground">
                              {item.product?.title ?? "Product"}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Size:
                            {" "}
                            {item.product.size?.length}
                            {" "}
                            ×
                            {" "}
                            {item.product.size?.width}
                            {" "}
                            ×
                            {" "}
                            {item.product.size?.height}
                            {" "}
                            {item.product.size?.unit}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                            <Badge variant="outline" className="bg-muted/40 text-[0.65rem] uppercase tracking-wide">
                              Qty
                              {" "}
                              {item.quantity ?? 0}
                            </Badge>
                            <span>
                              ID:
                              {" "}
                              {item.productId ?? "—"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold leading-tight text-foreground">
                            {currencySymbol}
                            {formatAmount(item.grandTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          : (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
                No line items found for this order.
              </div>
            )}
      </div>

      {order.notes && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-70" aria-hidden />
          <div className="relative space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Internal notes</p>
            <p className="leading-relaxed text-foreground">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
