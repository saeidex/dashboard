import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { products } from './data/products'

export function Products() {
  return (
    <ProductsProvider>
      <Header fixed hideBreadcrumbs/>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your products
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ProductsTable data={products} />
        </div>
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
