import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { DimensionsDialogs } from "./components/dimensions-dialogs";
import { DimensionsGrid } from "./components/dimensions-grid";
import { DimensionsPrimaryButtons } from "./components/dimensions-primary-buttons";
import { DimensionsProvider } from "./components/dimensions-provider";

export function ProductDimensions() {
  return (
    <DimensionsProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Product Dimensions
            </h2>
            <p className="text-muted-foreground">
              Manage product dimensions and sizes
            </p>
          </div>
          <DimensionsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <DimensionsGrid />
        </div>
      </Main>
      <DimensionsDialogs />
    </DimensionsProvider>
  );
}
