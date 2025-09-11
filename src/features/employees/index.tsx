import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { EmployeesDialogs } from './components/employees-dialogs'
import { EmployeesPrimaryButtons } from './components/employees-primary-buttons'
import { EmployeesProvider } from './components/employees-provider'
import { EmployeesTable } from './components/employees-table'
import { employees } from './data/employees'

const route = getRouteApi('/_authenticated/employees/')

export function Employees() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <EmployeesProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Employee List</h2>
            <p className='text-muted-foreground'>Manage your employees here.</p>
          </div>
          <EmployeesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <EmployeesTable
            data={employees}
            search={search}
            navigate={navigate}
          />
        </div>
      </Main>

      <EmployeesDialogs />
    </EmployeesProvider>
  )
}
