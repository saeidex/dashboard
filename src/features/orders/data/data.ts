export const orderStatusValues = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const

export const paymentStatusValues = [
  'unpaid',
  'partial',
  'paid',
  'refunded',
] as const

export const paymentMethodValues = [
  'cash',
  'card',
  'bank-transfer',
  'mobile-wallet',
] as const

export const OwnerInfo = {
  name: 'Universal Packaging & Accessories',
  address: 'Tongi, Gazipur',
  city: 'Dhaka',
  phone: '(123) 456-7890',
  email: 'support@example.com',
}
