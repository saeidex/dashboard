import { ArrowLeft, Download, Edit2, Printer } from 'lucide-react'
import { useOrderPrint } from '@/hooks/use-order-print'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Invoice } from './components/invoice'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersProvider, useOrders } from './components/orders-provider'
import { type Order } from './data/schema'

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
  const { printOrder, downloadOrderPdf } = useOrderPrint()

  return (
    <div className='hidden gap-2 md:flex'>
      <Button variant='outline' onClick={() => window.history.back()}>
        <ArrowLeft className='mr-2 h-4 w-4' />
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
        <Edit2 className='ml-2 h-4 w-4' />
      </Button>
      <Button
        variant='secondary'
        onClick={() => {
          setCurrentRow(order)
          downloadOrderPdf(order)
        }}
      >
        Download
        <Download className='ml-2 h-4 w-4' />
      </Button>
      <Button onClick={() => printOrder(order)}>
        Print
        <Printer className='ml-2 h-4 w-4' />
      </Button>
    </div>
  )
}
