import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmployeesActionDialog } from './employees-action-dialog'
import { useEmployees } from './employees-provider'

export function EmployeesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEmployees()
  return (
    <>
      <EmployeesActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <EmployeesActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='employee-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following employee has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this employee: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a employee with the Employee ID{' '}
                <strong>{currentRow.employeeId}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
