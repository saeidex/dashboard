import { type EmployeeStatus } from './schema'

export const callTypes = new Map<EmployeeStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['on-leave', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'terminated',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const employeePositions = [
  'Commercial Manager',
  'Manager',
  'Production Manager',
  'Corrugation Operator',
  'Crease Operator',
  'Pasting Operator',
  'Printing Master',
  'Stitching Operator',
  'Flexo Operator',
  'Cutting Man',
  'Delivery Man',
  'Helper',
]
