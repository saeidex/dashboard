import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { vendors } from '@/features/vendors/data/vendors'
import { OwnerInfo } from '../data/data'
import { type Order, type OrderItem } from '../data/schema'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'BDT' ? 'BDT' : 'USD',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace(/BDT/, '৳')
}

export const Invoice = ({
  order,
  printRef,
}: {
  order: Order
  printRef?: React.RefObject<HTMLDivElement | null>
}) => {
  const customer = vendors.find((v) => v.id === order.customerId)

  const columnHelper = createColumnHelper<OrderItem>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'index',
        header: '#',
        cell: (info) => info.row.index + 1,
        meta: { className: 'w-8 text-muted-foreground' },
      }),
      columnHelper.accessor('productTitle', {
        header: 'Item',
        cell: (info) => (
          <div className='min-w-40'>
            <div className='leading-tight font-medium'>{info.getValue()}</div>
            <div className='text-muted-foreground text-[11px]'>
              SKU: {info.row.original.sku}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor((r) => r.pricing.quantity, {
        id: 'quantity',
        header: 'Qty',
        cell: (info) => <span className='tabular-nums'>{info.getValue()}</span>,
        meta: { className: 'text-right w-12' },
      }),
      columnHelper.accessor((r) => r.pricing.unitPrice, {
        id: 'unitPrice',
        header: 'Unit',
        cell: (info) => (
          <span className='tabular-nums'>
            {formatCurrency(
              info.getValue(),
              info.row.original.pricing.currency
            )}
          </span>
        ),
        meta: { className: 'text-right w-20' },
      }),
      columnHelper.accessor((r) => r.pricing.discountAmount, {
        id: 'discount',
        header: 'Discount',
        cell: (info) => (
          <span className='tabular-nums'>
            {info.getValue()
              ? `- ${formatCurrency(info.getValue(), info.row.original.pricing.currency)}`
              : '—'}
          </span>
        ),
        meta: { className: 'text-right w-24' },
      }),
      columnHelper.accessor((r) => r.pricing.taxAmount, {
        id: 'tax',
        header: 'Tax',
        cell: (info) => (
          <span className='tabular-nums'>
            {info.getValue()
              ? formatCurrency(
                  info.getValue(),
                  info.row.original.pricing.currency
                )
              : '—'}
          </span>
        ),
        meta: { className: 'text-right w-20' },
      }),
      columnHelper.accessor((r) => r.pricing.total, {
        id: 'total',
        header: 'Total',
        cell: (info) => (
          <span className='font-medium tabular-nums'>
            {formatCurrency(
              info.getValue(),
              info.row.original.pricing.currency
            )}
          </span>
        ),
        meta: { className: 'text-right w-24' },
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: order.items,
    columns,
    state: {
      sorting: [] as SortingState,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='print:pt-0'>
      <div
        ref={printRef}
        className='bg-background relative mx-auto w-full max-w-4xl rounded-lg border p-6 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none'
      >
        <section className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between print:flex-row print:items-start print:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Invoice</h1>
            <h2 className='text-muted-foreground text-2xl font-light'>
              Order <span className='font-medium'>{order.orderNumber}</span>
            </h2>
            <p className='text-muted-foreground mt-1 text-xs'>
              Created: {order.createdAt.toLocaleDateString()} · Updated:{' '}
              {order.updatedAt.toLocaleDateString()}
            </p>
          </div>
          <div className='grid gap-2 text-sm md:text-right'>
            <div>
              <span className='font-medium'>Status:</span>{' '}
              <span className='capitalize'>{order.status}</span>
            </div>
            <div>
              <span className='font-medium'>Payment:</span>{' '}
              <span className='capitalize'>
                {order.paymentStatus}{' '}
                {order.paymentMethod && `(${order.paymentMethod})`}
              </span>
            </div>
            <div>
              <span className='font-medium'>Items:</span> {order.items.length}
            </div>
          </div>
        </section>

        <section className='parties-section mt-6 flex justify-between border-b pb-6 print:flex print:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-muted-foreground text-sm font-semibold tracking-wide'>
              From
            </h2>
            <p className='font-medium'>{OwnerInfo.name}</p>
            <p className='text-muted-foreground text-xs'>{OwnerInfo.address}</p>
            <p className='text-muted-foreground text-xs'>{OwnerInfo.city}</p>
            <p className='text-muted-foreground text-xs'>{OwnerInfo.email}</p>
            <p className='text-muted-foreground text-xs'>{OwnerInfo.phone}</p>
          </div>
          <div className='space-y-1'>
            <h2 className='text-muted-foreground text-sm font-semibold tracking-wide'>
              Bill To
            </h2>
            {customer ? (
              <>
                <p className='font-medium'>{customer.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {customer.address}
                </p>
                <p className='text-muted-foreground text-xs'>{customer.city}</p>
                <p className='text-muted-foreground text-xs'>
                  {customer.email}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {customer.phone}
                </p>
              </>
            ) : (
              <p className='text-muted-foreground text-xs'>Unknown customer</p>
            )}
          </div>
          <div className='space-y-1'>
            <h2 className='text-muted-foreground text-sm font-semibold tracking-wide'>
              Summary
            </h2>
            <p className='text-muted-foreground text-xs'>Order No.</p>
            <p className='font-medium'>{order.orderNumber}</p>
            <p className='text-muted-foreground text-xs'>Grand Total</p>
            <p className='font-medium'>
              {formatCurrency(order.totals.grandTotal, order.totals.currency)}
            </p>
          </div>
        </section>

        <section className='mt-6'>
          <Table className='border-collapse text-sm'>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className='bg-muted/50 print:bg-transparent'
                >
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.columnDef.meta?.className as string
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='last:border-b-0'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.columnDef.meta?.className as string
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className='mt-8 flex flex-col gap-4 md:flex-row md:justify-end print:flex-row print:justify-end'>
          <div className='w-full max-w-sm space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Items Subtotal</span>
              <span className='font-medium'>
                {formatCurrency(order.totals.itemsTotal, order.totals.currency)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Items Tax</span>
              <span className='font-medium'>
                {formatCurrency(
                  order.totals.itemsTaxTotal,
                  order.totals.currency
                )}
              </span>
            </div>
            {order.totals.discountTotal > 0 && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Discount</span>
                <span className='font-medium'>
                  -
                  {formatCurrency(
                    order.totals.discountTotal,
                    order.totals.currency
                  )}
                </span>
              </div>
            )}
            {order.totals.shipping > 0 && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shipping</span>
                <span className='font-medium'>
                  {formatCurrency(order.totals.shipping, order.totals.currency)}
                </span>
              </div>
            )}
            <div className='flex justify-between border-t pt-2 text-base'>
              <span className='font-semibold'>Grand Total</span>
              <span className='font-semibold'>
                {formatCurrency(order.totals.grandTotal, order.totals.currency)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media print {
          body { background: #fff; }
          header, .print-hidden { display: none !important; }
          main { padding: 0 !important; }
          table th, table td { font-size: 11px; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            .no-break { page-break-inside: avoid; }
          }
          @page { size: A4; margin: 16mm; }
      `}</style>
    </div>
  )
}
