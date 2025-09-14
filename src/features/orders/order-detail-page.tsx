import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Invoice } from './components/invoice'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersProvider, useOrders } from './components/orders-provider'
import { type Order } from './data/schema'
import { useOrderPrint } from './hooks/use-order-print'

export const OrderDetailPage = ({ order }: { order: Order }) => {
  return (
    <OrdersProvider>
      <Header fixed hideBreadcrumbs>
        <PrimaryButtons order={order} />
      </Header>
      <Main>
        <Invoice order={order} />
      </Main>
      <OrdersDialogs />
    </OrdersProvider>
  )
}

const PrimaryButtons = ({ order }: { order: Order }) => {
  const { setOpen, setCurrentRow } = useOrders()
  const { printOrder } = useOrderPrint()

  return (
    <div className='hidden gap-2 md:flex'>
      <Button variant='outline' onClick={() => window.history.back()}>
        Back
      </Button>
      <Button
        variant='secondary'
        onClick={() => {
          setCurrentRow(order)
          setOpen('edit')
        }}
      >
        Edit
      </Button>
      <Button onClick={() => printOrder(order)}>Print</Button>
    </div>
  )
}
