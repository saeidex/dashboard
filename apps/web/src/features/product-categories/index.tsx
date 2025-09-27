import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { CategoriesDialogs } from "./components/categories-dialogs";
import { CategoriesGrid } from "./components/categories-grid";
import { CategoriesPrimaryButtons } from "./components/categories-primary-button";
import { CategoriesProvider } from "./components/categories-provider";

export function ProductCagories() {
  return (
    <CategoriesProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your product categories
            </p>
          </div>
          <CategoriesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <CategoriesGrid />
        </div>
      </Main>
      <CategoriesDialogs />
    </CategoriesProvider>
  );
}
