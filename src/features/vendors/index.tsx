import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { VendorsDialogs } from './components/vendors-dialogs'
import { VendorsPrimaryButtons } from './components/vendors-primary-buttons'
import { VendorsProvider } from './components/vendors-provider'
import { VendorsTable } from './components/vendors-table'
import { vendors } from './data/vendors'

const route = getRouteApi('/_authenticated/vendors/')

export const Vendors = () => {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <VendorsProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vendors</h2>
            <p className='text-muted-foreground'>Manage your vendors here.</p>
          </div>
          <VendorsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <VendorsTable data={vendors} search={search} navigate={navigate} />
        </div>
      </Main>
      <VendorsDialogs />
    </VendorsProvider>
  )
}
