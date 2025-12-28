import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, notFound } from "@tanstack/react-router";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { customersQueryOptions } from "../customers/data/queries";
import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersPrimaryButtons } from "./components/orders-primary-buttons";
import { OrdersProvider } from "./components/orders-provider";
import { OrdersTable } from "./components/orders-table";

const Route = getRouteApi("/_authenticated/orders/$customerId");

export const CustomerOrders = () => {
  const params = Route.useParams();

  const { data: customers } = useSuspenseQuery(customersQueryOptions);
  const customer = customers.find(c => c.id === params.customerId);

  if (!customer) {
    throw notFound();
  }

  return (
    <OrdersProvider>
      <Header fixed />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Orders:
              {" "}
              <span className="text-primary">{customer.name}</span>
            </h2>
            <p className="text-muted-foreground">Manage customer orders</p>
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
