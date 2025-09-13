import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { categories, labels, statuses } from '../data/data'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const productsColumns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'productId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product ID' />
    ),
    cell: ({ row }) => (
      <div className='w-[96px] font-mono text-xs'>
        {row.getValue('productId')}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const label = labels.find((l) => l.value === row.original.label)
      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {status.icon && (
            <status.icon className='text-muted-foreground size-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'categoryId',
    accessorFn: (row) => row.categoryId,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const name =
        categories.find((c) => c.id === row.getValue('categoryId'))?.name || ''
      return <span className='truncate'>{name}</span>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'pricing.total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.original.pricing?.total ?? 0
      return <span>৳{price.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'pricing.base',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Base Price' />
    ),
    cell: ({ row }) => {
      const base = row.original.pricing?.base ?? 0
      return <span className='text-muted-foreground'>৳{base.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'pricing.discountAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discount' />
    ),
    cell: ({ row }) => {
      const amt = row.original.pricing?.discountAmount ?? 0
      const pct = row.original.pricing?.discountPercentage ?? 0
      if (!amt) return <span className='text-muted-foreground'>—</span>
      return (
        <span className='text-xs text-red-400'>
          -৳{amt.toFixed(2)} ({pct}%)
        </span>
      )
    },
  },
  {
    accessorKey: 'pricing.taxAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax' />
    ),
    cell: ({ row }) => {
      const taxAmount = row.original.pricing?.taxAmount ?? 0
      const taxPct = row.original.pricing?.taxPercentage ?? 0
      return (
        <span className='font-mono text-xs'>
          ৳{taxAmount.toFixed(2)} ({taxPct}%)
        </span>
      )
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const stock = row.getValue<number>('stock')
      return <span>{stock}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
