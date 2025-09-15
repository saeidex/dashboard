import { useOrderDistributions } from '@/hooks/use-dashboard-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RecentOrders } from '../recent-orders'

export function OrdersSection() {
  const { status, payment } = useOrderDistributions()

  const statusEntries = Object.entries(status).sort((a, b) => b[1] - a[1])
  const paymentEntries = Object.entries(payment).sort((a, b) => b[1] - a[1])
  const totalStatus = statusEntries.reduce((s, [, v]) => s + v, 0)
  const totalPayment = paymentEntries.reduce((s, [, v]) => s + v, 0)

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Current orders by lifecycle status.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {statusEntries.map(([k, v]) => {
              const pct = totalStatus ? (v / totalStatus) * 100 : 0
              return (
                <div key={k} className='flex items-center gap-2'>
                  <span className='w-24 capitalize'>{k}</span>
                  <div className='bg-muted h-2 flex-1 rounded-full'>
                    <div
                      className='bg-primary h-2 rounded-full'
                      style={{ width: pct.toFixed(1) + '%' }}
                    />
                  </div>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {v} ({pct.toFixed(0)}%)
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Funnel</CardTitle>
            <CardDescription>Unpaid → Paid → Refunded.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {paymentEntries.map(([k, v]) => {
              const pct = totalPayment ? (v / totalPayment) * 100 : 0
              return (
                <div key={k} className='flex items-center gap-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='capitalize'>{k}</span>
                      <span className='text-muted-foreground'>{v}</span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                      <div
                        className='bg-secondary h-2 rounded-full'
                        style={{ width: pct.toFixed(1) + '%' }}
                      />
                    </div>
                  </div>
                  <span className='text-muted-foreground w-12 text-right text-xs tabular-nums'>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Last 10 orders snapshot.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrders />
        </CardContent>
      </Card>
    </div>
  )
}
