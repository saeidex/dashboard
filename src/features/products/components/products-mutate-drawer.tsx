import { useEffect, useRef } from 'react'
import type { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { productCategories } from '@/features/product-categories/data/product-categories'
import { labels, statuses } from '../data/data'
import { productSchema, type Product } from '../data/schema'

type ProductMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
}

const formSchema = productSchema
  .required()
  .partial({
    id: true,
    label: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    pricing: productSchema.shape.pricing.partial({
      currency: true,
      discountPercentage: true,
      discountAmount: true,
      taxPercentage: true,
      taxAmount: true,
    }),
  })
type ProductForm = z.infer<typeof formSchema>

export function ProductsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProductMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isUpdate
      ? currentRow
      : {
          productId: '',
          sku: '',
          title: '',
          label: undefined,
          status: 'available',
          categoryId: undefined,
          price: 0,
          stock: 0,
          pricing: {
            base: 0,
            discountPercentage: 0,
            discountAmount: 0,
            taxPercentage: 0,
            taxAmount: 0,
            total: 0,
            currency: 'BDT',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
  })

  const base = useWatch({ control: form.control, name: 'pricing.base' })
  const discountPercentage = useWatch({
    control: form.control,
    name: 'pricing.discountPercentage',
  })
  const discountAmount = useWatch({
    control: form.control,
    name: 'pricing.discountAmount',
  })
  const taxPercentage = useWatch({
    control: form.control,
    name: 'pricing.taxPercentage',
  })

  const lastEditedRef = useRef<'discountPercentage' | 'discountAmount' | null>(
    null
  )

  useEffect(() => {
    const b = typeof base === 'number' ? base : 0
    let dPct = typeof discountPercentage === 'number' ? discountPercentage : 0
    let dAmt = typeof discountAmount === 'number' ? discountAmount : 0
    const tPct = typeof taxPercentage === 'number' ? taxPercentage : 0

    if (lastEditedRef.current === 'discountPercentage') {
      const expectedAmt = +(b * (dPct / 100)).toFixed(2)
      if (Math.abs(expectedAmt - dAmt) > 0.1) {
        form.setValue('pricing.discountAmount', expectedAmt, {
          shouldDirty: true,
          shouldValidate: false,
        })
        dAmt = expectedAmt
      }
    } else if (lastEditedRef.current === 'discountAmount') {
      // Clamp amount to base
      if (dAmt > b) {
        dAmt = b
        form.setValue('pricing.discountAmount', b, {
          shouldDirty: true,
          shouldValidate: false,
        })
      }
      const computedPct = b > 0 ? +((dAmt / b) * 100).toFixed(2) : 0
      const clampedPct = Math.min(100, Math.max(0, computedPct))
      if (Math.abs(clampedPct - dPct) > 0.1) {
        form.setValue('pricing.discountPercentage', clampedPct, {
          shouldDirty: true,
          shouldValidate: false,
        })
        dPct = clampedPct
      }
    } else {
      const expectedAmt = +(b * (dPct / 100)).toFixed(2)
      if (Math.abs(expectedAmt - dAmt) > 0.1) {
        form.setValue('pricing.discountAmount', expectedAmt, {
          shouldDirty: true,
          shouldValidate: false,
        })
        dAmt = expectedAmt
      }
    }

    const discountedBase = +(b - dAmt).toFixed(2)
    const taxAmt = +(discountedBase * (tPct / 100)).toFixed(2)
    const total = +(discountedBase + taxAmt).toFixed(2)
    form.setValue('pricing.taxAmount', taxAmt, { shouldDirty: true })
    form.setValue('pricing.total', total, { shouldDirty: true })
    form.setValue('price', total, { shouldDirty: true })

    lastEditedRef.current = null
  }, [base, discountPercentage, discountAmount, taxPercentage, form])

  const onSubmit = (data: ProductForm) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col sm:min-w-3xl'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Product</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the product by providing necessary info.'
              : 'Add a new product by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='products-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='productId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='PROD-1234' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sku'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='SKU1234' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter product title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-6 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select dropdown'
                      items={statuses.map((status) => ({
                        value: status.value,
                        label: status.label,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='label'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <div className='flex items-center gap-2'>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v || undefined)}
                        placeholder='Select label'
                        items={labels.map((l) => ({
                          value: l.value,
                          label: l.label,
                        }))}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => field.onChange(undefined)}
                        disabled={!field.value}
                      >
                        Clear
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value?.toString() || ''}
                        onValueChange={field.onChange}
                        placeholder='Select category'
                        items={productCategories.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='grid gap-6 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='stock'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='space-y-4 rounded-md border p-4'>
              <h4 className='font-medium'>Pricing Breakdown</h4>
              <div className='grid gap-4 md:grid-cols-6'>
                <FormField
                  control={form.control}
                  name='pricing.base'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pricing.discountPercentage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          {...field}
                          onChange={(e) => {
                            lastEditedRef.current = 'discountPercentage'
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pricing.discountAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amt</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          {...field}
                          onChange={(e) => {
                            lastEditedRef.current = 'discountAmount'
                            const value = parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pricing.taxPercentage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax %</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pricing.taxAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.1' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pricing.total'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.1' {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='products-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
