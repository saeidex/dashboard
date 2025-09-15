import { useProductsData } from '@/hooks/use-dashboard-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { computeKpis } from '../../data/data'
import { Metric } from '../matric'

export function ProductsSection() {
  const { top, lowStock } = useProductsData()
  const { inventoryValue } = computeKpis()
  const totalProducts = top.length
  const lowStockCount = lowStock.length
  const stockOuts = lowStock.filter((p) => p.stock === 0).length

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Metric label='Inventory Value' value={inventoryValue} currency />
        <Metric label='Total Products' value={totalProducts} />
        <Metric label='Low Stock Items' value={lowStockCount} />
        <Metric label='Stock Outs' value={stockOuts} />
      </div>
      <div className='grid gap-4 xl:grid-cols-7'>
        <Card className='xl:col-span-4'>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Based on sales amount.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {top.map((p) => (
              <div
                key={p.productId}
                className='flex items-center gap-2 text-sm'
              >
                <span className='flex-1 truncate'>{p.name}</span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  Qty {p.quantity}
                </span>
                <span className='font-medium tabular-nums'>
                  {p.revenue.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'BDT',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className='xl:col-span-3'>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items below threshold (≤10).</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {lowStock.length === 0 && (
              <p className='text-muted-foreground text-xs'>
                No low stock items.
              </p>
            )}
            {lowStock.map((p) => (
              <div
                key={p.id}
                className='flex items-center justify-between text-xs'
              >
                <span className='max-w-[140px] truncate' title={p.name}>
                  {p.name}
                </span>
                <span className='font-mono'>stk {p.stock}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
