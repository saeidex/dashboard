import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/web/components/ui/tabs";

import { useDashboardKpis } from "../../hooks/use-dashboard-data";
import { AuditTimeline } from "./components/audit-timeline";
import { Overview } from "./components/overview";
import { RecentOrders } from "./components/recent-orders";
import { ExpensesSection } from "./components/sections/expenses-section";
import { OrdersSection } from "./components/sections/orders-section";
import { ProductsSection } from "./components/sections/products-section";
import { dashboardSections } from "./sections";

type DashboardKpis = {
  salesTotal: number;
  ordersCount: number;
  avgOrderValue: number;
  expensesTotal: number;
  inventoryValue: number;
  trends?: Partial<
    Record<
      | "salesTotal"
      | "expensesTotal"
      | "ordersCount"
      | "avgOrderValue"
      | "inventoryValue",
      number
    >
  >;
};

export function Dashboard() {
  const kpis = useDashboardKpis() as DashboardKpis;
  const fmtTrend = (val?: number) => {
    if (val === undefined || Number.isNaN(val))
      return "—";
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(1)}% MoM`;
  };
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed />

      {/* ===== Main ===== */}
      <Main>
        <div className="mb-3 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {/* <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div> */}
        </div>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              {dashboardSections.map(section => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  disabled={section.disabled && section.id !== "overview"}
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {dashboardSections.map(section => (
            <TabsContent
              key={section.id}
              value={section.id}
              className="space-y-4"
            >
              {section.id === "overview" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                      label="Sales"
                      value={kpis.salesTotal}
                      currency
                      trend={fmtTrend(kpis.trends?.salesTotal)}
                    >
                      Gross order sales.
                    </KpiCard>
                    <KpiCard
                      label="Expenses"
                      value={kpis.expensesTotal}
                      currency
                      trend={fmtTrend(kpis.trends?.expensesTotal)}
                    >
                      Total operating spend.
                    </KpiCard>
                    <KpiCard
                      label="Avg Order Value"
                      value={kpis.avgOrderValue}
                      currency
                      trend={fmtTrend(kpis.trends?.avgOrderValue)}
                    >
                      Sales / orders.
                    </KpiCard>
                    <KpiCard
                      label="Inventory Value"
                      value={kpis.inventoryValue}
                      currency
                      trend={fmtTrend(kpis.trends?.inventoryValue)}
                    >
                      Stock * unit price.
                    </KpiCard>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <Card className="col-span-1 lg:col-span-4">
                      <CardHeader>
                        <CardTitle>Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="ps-2">
                        <Overview />
                      </CardContent>
                    </Card>
                    <Card className="col-span-1 lg:col-span-3">
                      <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                          You made 265 sales this month.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RecentOrders />
                      </CardContent>
                    </Card>
                  </div>
                  {/* Activity Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Track orders, payments, and other business events.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AuditTimeline limit={8} showViewAll={false} />
                    </CardContent>
                  </Card>
                </>
              )}
              {section.id === "orders" && <OrdersSection />}
              {section.id === "products" && <ProductsSection />}
              {section.id === "expenses" && <ExpensesSection />}
              {section.id === "activity" && (
                <AuditTimeline limit={100} variant="full" />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Main>
    </>
  );
}

type KpiCardProps = {
  label: string;
  value: number;
  currency?: boolean;
  trend?: string;
  children?: React.ReactNode;
};

function KpiCard({ label, value, currency, trend, children }: KpiCardProps) {
  const display = currency
    ? value.toLocaleString(undefined, {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      })
    : value.toLocaleString();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-muted-foreground text-xs">{trend}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{display}</div>
        {children && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
            {children}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
