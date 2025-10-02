import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import {
  useDashboardKpis,
  useExpenseCategories,
  useExpensesTrend,
} from "@/web/hooks/use-dashboard-data";

import { Metric } from "../matric";

export function ExpensesSection() {
  const categories = useExpenseCategories();
  const { expensesTotal } = useDashboardKpis();
  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);
  const avgPerCategory
    = categories.length > 0 ? expensesTotal / categories.length : 0;
  const [months, setMonths] = useState<3 | 6 | 12>(6);
  const trend = useExpensesTrend(months);
  const maxY = useMemo(
    () => (trend.length ? Math.max(...trend.map(d => d.total)) : 0),
    [trend],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Expenses" value={expensesTotal} currency />
        <Metric label="Avg / Category" value={avgPerCategory} currency />
      </div>
      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Expense Category Distribution</CardTitle>
            <CardDescription>
              Share of total expenses by category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((c) => {
              const pct = totalAmount ? (c.amount / totalAmount) * 100 : 0;
              return (
                <div key={c.category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium capitalize">
                      {c.category}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      ৳
                      {c.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                      {" "}
                      •
                      {" "}
                      {pct.toFixed(0)}
                      %
                    </span>
                  </div>
                  <div
                    className="bg-muted h-2 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={Number(pct.toFixed(1))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Category ${c.category} share`}
                  >
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Expenses Trend</CardTitle>
                <CardDescription>
                  Last
                  {months}
                  {" "}
                  months
                </CardDescription>
              </div>
              <div className="flex gap-1">
                {[3, 6, 12].map(m => (
                  <Button
                    variant="ghost"
                    key={m}
                    onClick={() => setMonths(m as 3 | 6 | 12)}
                    className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${months === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    aria-label={`Show last ${m} months`}
                  >
                    {m}
                    m
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trend.length === 0
              ? (
                  <div className="text-muted-foreground flex h-24 w-full items-center justify-center rounded-md border text-xs">
                    No data
                  </div>
                )
              : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trend}
                        margin={{ left: 4, right: 4, top: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="expenseFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="monthLabel"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <YAxis
                          width={48}
                          tickFormatter={v =>
                            `৳${
                              Number(v).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}`}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, maxY]}
                        />
                        <Tooltip
                          cursor={{
                            stroke: "hsl(var(--primary))",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                          contentStyle={{ fontSize: 12 }}
                          formatter={(value: number) => [
                            `৳${
                              Number(value).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}`,
                            "Expenses",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="hsl(var(--primary))"
                          fill="url(#expenseFill)"
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
