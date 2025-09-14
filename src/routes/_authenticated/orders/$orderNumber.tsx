import { createFileRoute, notFound } from '@tanstack/react-router'
import { orders } from '@/features/orders/data/orders'
import { OrderDetailPage } from '@/features/orders/order-detail-page'

export const Route = createFileRoute('/_authenticated/orders/$orderNumber')({
  parseParams: (p) => ({ orderNumber: p.orderNumber }),
  loader: ({ params }) => {
    const order = orders.find((o) => o.orderNumber === params.orderNumber)
    if (!order) {
      throw notFound()
    }
    return { order }
  },
  component: () => <RouteComponent />,
})

const RouteComponent = () => {
  const { order } = Route.useLoaderData()
  return <OrderDetailPage order={order} />
}
