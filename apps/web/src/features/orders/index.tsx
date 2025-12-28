import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { CustomersGrid } from "./customers-grid";

export const Orders = () => {
  return (
    <>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">Organized by Customers.</p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <CustomersGrid />
        </div>
      </Main>
    </>
  );
};
