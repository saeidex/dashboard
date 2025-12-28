import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";

import { EmployeesDialogs } from "./components/employees-dialogs";
import { EmployeesPrimaryButtons } from "./components/employees-primary-buttons";
import { EmployeesProvider } from "./components/employees-provider";
import { EmployeesTable } from "./components/employees-table";
import { NoEmployees } from "./components/no-employees";
import { employeesQueryOptions } from "./data/queries";

export function Employees() {
  const { data: employees } = useSuspenseQuery(employeesQueryOptions);

  if (!employees || employees.length === 0) {
    return (
      <EmployeesProvider>
        <NoEmployees />
        <EmployeesDialogs />
      </EmployeesProvider>
    );
  }

  return (
    <EmployeesProvider>
      <Header fixed hideBreadcrumbs />

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground">Manage your employees here.</p>
          </div>
          <EmployeesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <EmployeesTable />
        </div>
      </Main>

      <EmployeesDialogs />
    </EmployeesProvider>
  );
}
