import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { CustomersDialogs } from "./components/customers-dialogs";
import { CustomersPrimaryButtons } from "./components/customers-primary-buttons";
import { CustomersProvider } from "./components/customers-provider";
import { CustomersTable } from "./components/customers-table";

export const Customers = () => {
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
          <CustomersTable />
        </div>
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  );
};
