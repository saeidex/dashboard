import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ExpensesDialogs } from './components/expenses-dialogs'
import { ExpensesPrimaryButtons } from './components/expenses-primary-buttons'
import { ExpensesProvider } from './components/expenses-provider'
import { ExpensesTable } from './components/expenses-table'
import { expenses } from './data/expenses'

const route = getRouteApi('/_authenticated/expenses/')

export const Expenses = () => {
  const navigate = route.useNavigate()
  const search = route.useSearch()

  return (
    <ExpensesProvider>
      <Header fixed hideBreadcrumbs />
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Expenses</h2>
            <p className='text-muted-foreground'>
              Manage your bills, vouchers, costs etc. here.
            </p>
          </div>
          <ExpensesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ExpensesTable data={expenses} search={search} navigate={navigate} />
        </div>
      </Main>
      <ExpensesDialogs />
    </ExpensesProvider>
  )
}
