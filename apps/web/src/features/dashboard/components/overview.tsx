import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/web/components/ui/button";
import { useSalesTrend } from "@/web/hooks/use-dashboard-data";

export function Overview() {
  const [months, setMonths] = useState<3 | 6 | 12 | 18>(3);
  const data = useSalesTrend(months);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Last
          {" "}
          {months}
          {" "}
          months
        </div>
        <div className="flex gap-1">
          {[3, 6, 12, 18].map(m => (
            <Button
              variant="ghost"
              key={m}
              onClick={() => setMonths(m as 3 | 6 | 12 | 18)}
              className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${months === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              aria-label={`Show last ${m} months`}
            >
              {m}
              m
            </Button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="monthLabel"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => `৳${value}`}
          />
          <Tooltip
            contentStyle={{
              color: "var(--popover-foreground)",
              backgroundColor: "var(--popover)",
            }}
            cursor={{ className: "fill-black/10" }}
            formatter={(value: unknown) => {
              const num = typeof value === "number" ? value : Number(value);
              return [
                `৳${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                "Sales",
              ];
            }}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
