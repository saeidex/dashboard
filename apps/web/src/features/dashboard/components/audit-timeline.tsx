import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  startOfDay,
} from "date-fns";
import {
  ArrowRightLeft,
  Calendar,
  CircleDollarSign,
  Clock,
  Package,
  Printer,
  RefreshCw,
  Truck,
} from "lucide-react";

import type { AuditActionType } from "@/api/db/schema/audit-logs";

import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { cn } from "@/web/lib/utils";

import {
  auditLogsQueryOptions,
  recentAuditLogsQueryOptions,
} from "../data/audit-queries";

const ACTION_CONFIG: Record<
  AuditActionType,
  {
    icon: typeof Package;
    color: string;
    bgColor: string;
    printColor: string;
    label: string;
  }
> = {
  order_created: {
    icon: Package,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    printColor: "print:text-green-700 print:bg-green-50",
    label: "New Order",
  },
  order_updated: {
    icon: RefreshCw,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    printColor: "print:text-blue-700 print:bg-blue-50",
    label: "Order Updated",
  },
  order_deleted: {
    icon: Package,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    printColor: "print:text-red-700 print:bg-red-50",
    label: "Order Deleted",
  },
  order_status_changed: {
    icon: Truck,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    printColor: "print:text-orange-700 print:bg-orange-50",
    label: "Status Changed",
  },
  payment_received: {
    icon: CircleDollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    printColor: "print:text-emerald-700 print:bg-emerald-50",
    label: "Payment Received",
  },
  payment_updated: {
    icon: ArrowRightLeft,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    printColor: "print:text-yellow-700 print:bg-yellow-50",
    label: "Payment Updated",
  },
  payment_deleted: {
    icon: CircleDollarSign,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    printColor: "print:text-red-700 print:bg-red-50",
    label: "Payment Deleted",
  },
  customer_created: {
    icon: Package,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    printColor: "print:text-purple-700 print:bg-purple-50",
    label: "New Customer",
  },
  customer_updated: {
    icon: RefreshCw,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    printColor: "print:text-purple-700 print:bg-purple-50",
    label: "Customer Updated",
  },
  product_created: {
    icon: Package,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    printColor: "print:text-indigo-700 print:bg-indigo-50",
    label: "New Product",
  },
  product_updated: {
    icon: RefreshCw,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    printColor: "print:text-indigo-700 print:bg-indigo-50",
    label: "Product Updated",
  },
};

type AuditLog = {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: Date | string;
  order?: { id: number; grandTotal: number } | null;
  customer?: { id: string; name: string } | null;
};

type DateGroup = {
  label: string;
  date: Date;
  logs: AuditLog[];
};

function getDateLabel(date: Date): string {
  if (isToday(date))
    return "Today";
  if (isYesterday(date))
    return "Yesterday";
  return format(date, "EEEE, MMMM d, yyyy");
}

function groupLogsByDate(logs: AuditLog[]): DateGroup[] {
  const groups = new Map<string, DateGroup>();

  for (const log of logs) {
    const date = new Date(log.createdAt);
    const dayStart = startOfDay(date);
    const key = dayStart.toISOString();

    if (!groups.has(key)) {
      groups.set(key, {
        label: getDateLabel(date),
        date: dayStart,
        logs: [],
      });
    }

    groups.get(key)!.logs.push(log);
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

type AuditTimelineProps = {
  /** Number of logs to fetch */
  limit?: number;
  /** Show "Showing latest X activities" text */
  showViewAll?: boolean;
  /** "compact" for dashboard card, "full" for activity tab with print support */
  variant?: "compact" | "full";
};

export function AuditTimeline({
  limit = 10,
  showViewAll = true,
  variant = "compact",
}: AuditTimelineProps) {
  // Use different query based on variant
  const { data: recentData, isLoading: recentLoading } = useQuery({
    ...recentAuditLogsQueryOptions(limit),
    enabled: variant === "compact",
  });

  const { data: fullData, isLoading: fullLoading } = useQuery({
    ...auditLogsQueryOptions({ limit }),
    enabled: variant === "full",
  });

  const isLoading = variant === "compact" ? recentLoading : fullLoading;
  const logs
    = variant === "compact"
      ? (recentData as AuditLog[] | undefined)
      : (fullData?.data as AuditLog[] | undefined);

  const groupedLogs = logs ? groupLogsByDate(logs) : [];
  const totalActivities = logs?.length ?? 0;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={`skeleton-${i}`} className="flex animate-pulse gap-4">
            <div className="size-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <Clock className="mr-2 size-4" />
        No activity recorded yet.
      </div>
    );
  }

  // Full variant with print support
  if (variant === "full") {
    return (
      <div className="space-y-6">
        {/* Print Header - Only visible when printing */}
        <div className="mb-8 hidden print:block">
          <div className="border-b-2 border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Activity History Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Generated on
              {" "}
              {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-sm text-gray-600">
              Total Activities:
              {" "}
              {totalActivities}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-lg font-semibold">Activity History</h2>
            <p className="text-sm text-muted-foreground">
              Complete audit log of all business activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 size-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 print:hidden">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupedLogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {logs && logs.length > 0
                  ? formatDistanceToNow(new Date(logs[0].createdAt), {
                      addSuffix: true,
                    })
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Timeline */}
        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="print:hidden">
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              A chronological view of all recorded activities
            </CardDescription>
          </CardHeader>
          <CardContent className="print:p-0">
            <TimelineContent groupedLogs={groupedLogs} isPrintable />
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="mt-8 hidden border-t pt-4 text-center text-sm text-gray-500 print:block">
          <p>End of Activity Report</p>
          <p className="mt-1 text-xs">
            Page generated from Business Dashboard •
            {" "}
            {format(new Date(), "yyyy")}
          </p>
        </div>
      </div>
    );
  }

  // Compact variant for dashboard card
  return (
    <div className="space-y-6">
      <TimelineContent groupedLogs={groupedLogs} isPrintable={false} />

      {showViewAll && logs && logs.length >= limit && (
        <div className="pt-2 text-center">
          <span className="text-xs text-muted-foreground">
            Showing latest
            {" "}
            {limit}
            {" "}
            activities
          </span>
        </div>
      )}
    </div>
  );
}

type TimelineContentProps = {
  groupedLogs: DateGroup[];
  isPrintable: boolean;
};

function TimelineContent({ groupedLogs, isPrintable }: TimelineContentProps) {
  return (
    <div className={cn("space-y-6", isPrintable && "print:space-y-4")}>
      {groupedLogs.map((group, groupIndex) => (
        <div
          key={group.date.toISOString()}
          className={cn("relative", isPrintable && "print:break-inside-avoid")}
        >
          {/* Date Header */}
          <div
            className={cn(
              "sticky top-0 z-20 mb-4 flex items-center gap-2 bg-background/95 pb-2 backdrop-blur-sm",
              isPrintable && "print:static print:bg-transparent print:pb-0",
            )}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full bg-primary/10",
                isPrintable && "print:bg-gray-100",
              )}
            >
              <Calendar
                className={cn(
                  "size-4 text-primary",
                  isPrintable && "print:text-gray-600",
                )}
              />
            </div>
            <h3
              className={cn(
                "text-sm font-semibold text-foreground",
                isPrintable && "print:text-gray-900",
              )}
            >
              {group.label}
            </h3>
            <div
              className={cn(
                "h-px flex-1 bg-border",
                isPrintable && "print:bg-gray-300",
              )}
            />
            <span
              className={cn(
                "text-xs text-muted-foreground",
                isPrintable && "print:text-gray-500",
              )}
            >
              {group.logs.length}
              {" "}
              {group.logs.length === 1 ? "activity" : "activities"}
            </span>
          </div>

          {/* Timeline for this date */}
          <div className="relative ml-4">
            {/* Vertical timeline line */}
            <div
              className={cn(
                "absolute left-4.5 top-2 h-[calc(100%-16px)] w-px bg-linear-to-b from-border via-border to-transparent",
                isPrintable && "print:bg-gray-200",
              )}
            />

            {group.logs.map((log, logIndex) => {
              const config = ACTION_CONFIG[
                log.actionType as AuditActionType
              ] ?? {
                icon: Clock,
                color: "text-gray-600 dark:text-gray-400",
                bgColor: "bg-gray-100 dark:bg-gray-900/30",
                printColor: "print:text-gray-700 print:bg-gray-50",
                label: log.actionType,
              };
              const Icon = config.icon;
              const isLast
                = logIndex === group.logs.length - 1
                  && groupIndex === groupedLogs.length - 1;

              return (
                <div
                  key={log.id}
                  className={cn(
                    "group relative flex gap-4 pb-5 transition-colors",
                    !isLast
                    && "before:absolute before:left-4.5 before:top-10 before:h-full before:w-px",
                  )}
                >
                  {/* Icon */}
                  <div className="relative">
                    <div
                      className={cn(
                        "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-110",
                        config.bgColor,
                        isPrintable && config.printColor,
                        isPrintable
                        && "print:border-gray-200 print:shadow-none",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          config.color,
                          isPrintable && "print:text-inherit",
                        )}
                      />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg border bg-card/50 p-3 shadow-sm transition-all hover:bg-card hover:shadow-md",
                      isPrintable
                      && "print:border-gray-200 print:bg-white print:shadow-none",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "shrink-0 text-[10px] font-medium uppercase tracking-wide",
                              config.color,
                              config.bgColor,
                              isPrintable
                              && "print:border print:border-gray-300",
                            )}
                          >
                            {config.label}
                          </Badge>
                          <time
                            className={cn(
                              "text-[11px] text-muted-foreground",
                              isPrintable && "print:text-gray-500",
                            )}
                          >
                            {format(new Date(log.createdAt), "h:mm a")}
                          </time>
                        </div>
                        <p
                          className={cn(
                            "text-sm leading-relaxed text-foreground",
                            isPrintable && "print:text-gray-800",
                          )}
                        >
                          {log.description}
                        </p>
                        {log.customer && (
                          <Link
                            to="/orders/$customerId"
                            params={{ customerId: log.customer.id }}
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary",
                              isPrintable
                              && "print:text-gray-500 print:no-underline",
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {log.customer.name}
                          </Link>
                        )}
                      </div>
                      <time
                        className={cn(
                          "shrink-0 text-[11px] text-muted-foreground",
                          isPrintable && "print:hidden",
                        )}
                      >
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
