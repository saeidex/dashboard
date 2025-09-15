import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Metric = ({
  label,
  value,
  currency,
  suffix,
}: {
  label: string
  value: number
  currency?: boolean
  suffix?: string
}) => {
  const display = currency
    ? value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
      })
    : suffix
      ? `${value.toFixed(0)}${suffix}`
      : value.toLocaleString()
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{display}</div>
      </CardContent>
    </Card>
  )
}
