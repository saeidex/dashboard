import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";
import { useOrdersUiStore } from "@/web/stores/orders-ui-store";

import { customersQueryOptions } from "../customers/data/queries";
import { createProductsQueryOptions } from "../products/data/queries";
import { NoOrders } from "./components/no-orders";
import { OrdersDialogs } from "./components/orders-dialogs";
import { OrdersKanban } from "./components/orders-kanban";
import { OrdersPrimaryButtons } from "./components/orders-primary-buttons";
import { OrdersProvider } from "./components/orders-provider";
import { OrdersTable } from "./components/orders-table";
import { createOrdersQueryOptions } from "./data/queries";

const Route = getRouteApi("/_authenticated/orders/$customerId/");

export const CustomerOrders = () => {
  const params = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const view = search.view ?? "table";
  const kanbanLayout = useOrdersUiStore(s => s.kanbanLayout);
  const setKanbanLayout = useOrdersUiStore(s => s.setKanbanLayout);
  const didWriteLayoutToUrlRef = useRef(false);

  useEffect(() => {
    if (search.kanbanLayout && search.kanbanLayout !== kanbanLayout) {
      setKanbanLayout(search.kanbanLayout);
    }
    if (search.kanbanLayout)
      didWriteLayoutToUrlRef.current = true;
  }, [kanbanLayout, search.kanbanLayout, setKanbanLayout]);

  useEffect(() => {
    if (view !== "kanban") {
      didWriteLayoutToUrlRef.current = false;
      return;
    }

    // If the URL doesn't specify a layout, write the persisted one once.
    // If the URL does specify a layout, it remains the source of truth.
    if (search.kanbanLayout)
      return;
    if (didWriteLayoutToUrlRef.current)
      return;

    didWriteLayoutToUrlRef.current = true;

    navigate({
      to: ".",
      replace: true,
      search: prev => ({ ...prev, kanbanLayout }),
    });
  }, [kanbanLayout, navigate, search.kanbanLayout, view]);

  const { data: customers } = useSuspenseQuery(customersQueryOptions);
  const { data: orders } = useSuspenseQuery(
    createOrdersQueryOptions({
      customerId: params.customerId,
      view,
    }),
  );
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());

  const customer = customers.find(c => c.id === params.customerId);

  if (!customer) {
    return <NoOrders reason="no-customers" />;
  }

  if (!products || products.length === 0) {
    return (
      <OrdersProvider>
        <NoOrders reason="no-products" />
      </OrdersProvider>
    );
  }

  if (!orders || orders.rows.length === 0) {
    return (
      <OrdersProvider>
        <NoOrders reason="no-orders" />
        <OrdersDialogs />
      </OrdersProvider>
    );
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
          <OrdersPrimaryButtons
            view={view}
            kanbanLayout={kanbanLayout}
            onViewChange={(newView) => {
              navigate({
                to: ".",
                search: prev => ({ ...prev, view: newView }),
              });
            }}
            onKanbanLayoutChange={(layout) => {
              setKanbanLayout(layout);
              navigate({
                to: ".",
                replace: true,
                search: prev => ({ ...prev, kanbanLayout: layout }),
              });
            }}
          />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {view === "table"
            ? (
                <OrdersTable />
              )
            : (
                <OrdersKanban orders={orders.rows} />
              )}
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  );
};
