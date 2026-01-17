import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { FactoriesDialogs } from "./components/factories-dialogs";
import { FactoriesPrimaryButtons } from "./components/factories-primary-buttons";
import { FactoriesProvider } from "./components/factories-provider";
import { FactoriesTable } from "./components/factories-table";
import { NoFactories } from "./components/no-factories";
import { factoriesQueryOptions } from "./data/queries";

export const Factories = () => {
  const { data: factories } = useSuspenseQuery(factoriesQueryOptions);

  if (!factories || factories.length === 0) {
    return (
      <FactoriesProvider>
        <NoFactories />
        <FactoriesDialogs />
      </FactoriesProvider>
    );
  }

  return (
    <FactoriesProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Factories</h2>
            <p className="text-muted-foreground">
              Manage your production factories here.
            </p>
          </div>
          <FactoriesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <FactoriesTable />
        </div>
      </Main>

      <FactoriesDialogs />
    </FactoriesProvider>
  );
};
