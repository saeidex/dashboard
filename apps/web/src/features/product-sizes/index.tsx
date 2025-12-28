import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { categoriesQueryOptions } from "../product-categories/data/queries";
import { NoSizes } from "./components/no-sizes";
import { SizesDialogs } from "./components/sizes-dialogs";
import { SizesGrid } from "./components/sizes-grid";
import { SizesPrimaryButtons } from "./components/sizes-primary-buttons";
import { SizesProvider } from "./components/sizes-provider";

export function ProductSizes() {
  const { data: sizes } = useSuspenseQuery(categoriesQueryOptions);

  if (!sizes || sizes.length === 0) {
    return (
      <SizesProvider>
        <NoSizes />
        <SizesDialogs />
      </SizesProvider>
    );
  }

  return (
    <SizesProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Product Sizes
            </h2>
            <p className="text-muted-foreground">
              Manage product sizes and sizes
            </p>
          </div>
          <SizesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <SizesGrid />
        </div>
      </Main>
      <SizesDialogs />
    </SizesProvider>
  );
}
