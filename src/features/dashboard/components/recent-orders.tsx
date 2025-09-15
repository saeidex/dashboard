import { useMemo } from 'react'
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import { paymentStatusValues } from '@/features/orders/data/data'
import { orders } from '@/features/orders/data/orders'
import { vendors } from '@/features/vendors/data/vendors'
import { type PaymentStatus } from '../data/data'

interface RecentOrdersProps {
  limit?: number
  type?: 'all' | PaymentStatus | 'sales'
}

export function RecentOrders({ limit = 6, type }: RecentOrdersProps) {
  const recent = useMemo(() => {
    let recentOrders = [...orders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    if (type === 'sales') {
      recentOrders = recentOrders.filter(
        (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'partial'
      )
    } else if (paymentStatusValues.includes(type as PaymentStatus)) {
      recentOrders = recentOrders.filter((o) => o.paymentStatus === type)
    } else {
      recentOrders = recentOrders.filter(
        (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'partial'
      )
    }

    return recentOrders.slice(0, limit).map((o) => {
      const vendor = vendors.find((v) => v.id === o.customerId)
      return {
        id: o.id,
        name: vendor?.name ?? 'Unknown Vendor',
        email: vendor?.email ?? 'unknown@example.com',
        total: o.totals.grandTotal,
      }
    })
  }, [limit, type])

  return (
    <div className='space-y-6'>
      {recent.map((r) => {
        const tokens = r.name.match(/[A-Za-z0-9]+/g) || []
        const initials = (
          tokens
            .slice(0, 2)
            .map((t) => t[0])
            .join('') || '?'
        ).toUpperCase()

        return (
          <div key={r.id} className='flex items-center gap-4'>
            <Avatar className='bg-muted flex h-9 w-9 items-center justify-center rounded-full border'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{r.name}</p>
                <p className='text-muted-foreground text-xs'>{r.email}</p>
              </div>
              <div className='font-medium tabular-nums'>
                +৳
                {r.total.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        )
      })}
      {recent.length === 0 && (
        <p className='text-muted-foreground text-sm'>No recent sales.</p>
      )}
    </div>
  )
}
