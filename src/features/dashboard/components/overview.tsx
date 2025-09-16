import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMonthlySalesSeries } from '../data/data'

export function Overview({ months = 12 }: { months?: number }) {
  const data = useMemo(() => getMonthlySalesSeries(months), [months])
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='monthLabel'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`}
        />
        <Tooltip
          contentStyle={{
            color: 'var(--popover-foreground)',
            backgroundColor: 'var(--popover)',
          }}
          cursor={{ className: 'fill-black/10' }}
          formatter={(value: unknown) => {
            const num = typeof value === 'number' ? value : Number(value)
            return [
              `৳${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              'Sales',
            ]
          }}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
