import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  Timer,
} from 'lucide-react'

export const labels = [
  {
    value: 'new',
    label: 'New',
  },
  {
    value: 'premium',
    label: 'Premium',
  },
]

export const statuses = [
  {
    label: 'Available',
    value: 'available' as const,
    icon: CheckCircle,
  },
  {
    label: 'Out of Stock',
    value: 'out-of-stock' as const,
    icon: CircleOff,
  },
  {
    label: 'Coming Soon',
    value: 'coming-soon' as const,
    icon: Timer,
  },
  {
    label: 'Discontinued',
    value: 'discontinued' as const,
    icon: Circle,
  },
]

export const categories = [
  {
    label: 'Electronics',
    value: 'electronics' as const,
    icon: ArrowDown,
  },
  {
    label: 'Clothing',
    value: 'clothing' as const,
    icon: ArrowRight,
  },
  {
    label: 'Home & Garden',
    value: 'home-garden' as const,
    icon: ArrowUp,
  },
  {
    label: 'Featured',
    value: 'featured' as const,
    icon: AlertCircle,
  },
]
