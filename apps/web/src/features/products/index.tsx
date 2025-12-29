import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { categoriesQueryOptions } from "../product-categories/data/queries";
import { NoProducts } from "./components/no-products";
import { ProductsDialogs } from "./components/products-dialogs";
import { ProductsPrimaryButtons } from "./components/products-primary-buttons";
import { ProductsProvider } from "./components/products-provider";
import { ProductsTable } from "./components/products-table";
import { createProductsQueryOptions } from "./data/queries";

export function Products() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: products } = useSuspenseQuery(createProductsQueryOptions());

  if (!categories || categories.length === 0) {
    return (
      <ProductsProvider>
        <NoProducts reason="no-categories" />
        <ProductsDialogs />
      </ProductsProvider>
    );
  }

  if (!products || products.length === 0) {
    return (
      <ProductsProvider>
        <NoProducts reason="no-products" />
        <ProductsDialogs />
      </ProductsProvider>
    );
  }

  return (
    <ProductsProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Samples</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your sample products
            </p>
          </div>
          {categories && categories.length > 0 && <ProductsPrimaryButtons />}
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <ProductsTable />
        </div>
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  );
}
