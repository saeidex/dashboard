import { FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrders } from './orders-provider'

export function OrdersPrimaryButtons() {
  const { setOpen } = useOrders()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Order</span> <FilePlus size={18} />
      </Button>
    </div>
  )
}
