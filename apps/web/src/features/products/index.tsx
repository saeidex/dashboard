import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import type { Product } from "./data/schema";

import { ProductsDialogs } from "./components/products-dialogs";
import { ProductsPrimaryButtons } from "./components/products-primary-buttons";
import { ProductsProvider } from "./components/products-provider";
import { ProductsTable } from "./components/products-table";
import { createProductsQueryOptions } from "./data/queries";

const route = getRouteApi("/_authenticated/products/");

export function Products() {
  const search = route.useSearch();
  const { data: products } = useSuspenseQuery(createProductsQueryOptions(search));

  return (
    <ProductsProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your products
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <ProductsTable data={products as Product[]} />
        </div>
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  );
}
