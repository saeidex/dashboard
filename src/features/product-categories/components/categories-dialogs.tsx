import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { CategoriesActionDialog } from './categories-actions-dialog'
import { useCategories } from './categories-provider'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()
  return (
    <>
      <CategoriesActionDialog
        key='category-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />
      {currentRow && (
        <>
          <CategoriesActionDialog
            key={`category-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='category-delete'
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
                'The following category has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this category: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a category with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
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
