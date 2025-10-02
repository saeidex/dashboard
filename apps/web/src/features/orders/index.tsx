import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersPrimaryButtons } from "./components/orders-primary-buttons";
import { OrdersProvider } from "./components/orders-provider";
import { OrdersTable } from "./components/orders-table";

export const Orders = () => {
  return (
    <OrdersProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">Manage your orders here.</p>
          </div>
          <OrdersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <OrdersTable />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  );
};
