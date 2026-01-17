import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { NoPayments } from "./components/no-payments";
import { PaymentsDialogs } from "./components/payments-dialogs";
import { PaymentsPrimaryButtons } from "./components/payments-primary-buttons";
import { PaymentsProvider } from "./components/payments-provider";
import { PaymentsTable } from "./components/payments-table";
import { createPaymentsQueryOptions } from "./data/queries";

export const Payments = () => {
  const { data } = useSuspenseQuery(createPaymentsQueryOptions());

  if (!data || data.rowCount === 0) {
    return (
      <PaymentsProvider>
        <NoPayments />
        <PaymentsDialogs />
      </PaymentsProvider>
    );
  }

  return (
    <PaymentsProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
            <p className="text-muted-foreground">
              Track and manage all payment transactions.
            </p>
          </div>
          <PaymentsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <PaymentsTable />
        </div>
      </Main>
      <PaymentsDialogs />
    </PaymentsProvider>
  );
};
