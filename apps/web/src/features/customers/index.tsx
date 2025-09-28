import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { CustomersDialogs } from "./components/customers-dialogs";
import { CustomersPrimaryButtons } from "./components/customers-primary-buttons";
import { CustomersProvider } from "./components/customers-provider";
import { CustomersTable } from "./components/customers-table";
import { customersQueryOptions } from "./data/queries";

const route = getRouteApi("/_authenticated/customers/");

export const Customers = () => {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const { data } = useSuspenseQuery(customersQueryOptions);

  return (
    <CustomersProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">Manage your customers here.</p>
          </div>
          <CustomersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {/* @ts-expect-error Date parsed as string */}
          <CustomersTable data={data} search={search} navigate={navigate} />
        </div>
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  );
};
