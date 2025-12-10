import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Discount, CreateDiscountRequest, UpdateDiscountRequest } from '../../../store/api/discountApi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { cn } from '../../../lib/utils'

const discountSchema = yup.object({
  code: yup.string().max(50, 'Code must be less than 50 characters'),
  name: yup.string().required('Name is required').max(100, 'Name must be less than 100 characters'),
  discountType: yup.string().oneOf(['percentage', 'fixed']).required('Discount type is required'),
  discountValue: yup.number().positive('Value must be positive').required('Value is required'),
  minPurchaseAmount: yup.number().min(0, 'Min purchase cannot be negative').default(0),
  maxDiscountAmount: yup.number().positive('Max discount must be positive'),
  startDate: yup.date(),
  endDate: yup.date(),
  usageLimit: yup.number().integer().positive('Usage limit must be positive'),
  isActive: yup.boolean().default(true),
})

interface DiscountFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDiscountRequest | UpdateDiscountRequest) => void
  discount?: Discount
  mode: 'create' | 'edit'
}

const DiscountForm = ({ open, onClose, onSubmit, discount, mode }: DiscountFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(discountSchema),
    defaultValues: {
      code: '',
      name: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: undefined,
      startDate: '',
      endDate: '',
      usageLimit: undefined,
      isActive: true,
    },
  })

  const discountType = watch('discountType')

  useEffect(() => {
    if (discount && mode === 'edit') {
      reset({
        code: discount.code || '',
        name: discount.name,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        minPurchaseAmount: discount.minPurchaseAmount,
        maxDiscountAmount: discount.maxDiscountAmount || undefined,
        startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
        endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
        usageLimit: discount.usageLimit || undefined,
        isActive: discount.isActive,
      })
    } else {
      reset({
        code: '',
        name: '',
        discountType: 'percentage',
        discountValue: 0,
        minPurchaseAmount: 0,
        maxDiscountAmount: undefined,
        startDate: '',
        endDate: '',
        usageLimit: undefined,
        isActive: true,
      })
    }
  }, [discount, mode, reset, open])

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      usageLimit: data.usageLimit || undefined,
      maxDiscountAmount: data.maxDiscountAmount || undefined,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create Discount' : 'Edit Discount'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new discount or promotion code'
              : 'Update discount information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code (Optional)</Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="code"
                    placeholder="Enter discount code"
                    className={cn(errors.code && 'border-red-500')}
                  />
                )}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Discount Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Discount Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter discount name"
                    className={cn(errors.name && 'border-red-500')}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Type */}
            <div className="space-y-2">
              <Label htmlFor="discountType">
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="discountType" className={cn(errors.discountType && 'border-red-500')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && (
                <p className="text-sm text-red-500">{errors.discountType.message}</p>
              )}
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="discountValue"
                    type="number"
                    step="0.01"
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={cn(errors.discountValue && 'border-red-500')}
                  />
                )}
              />
              {errors.discountValue && (
                <p className="text-sm text-red-500">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min Purchase Amount */}
            <div className="space-y-2">
              <Label htmlFor="minPurchaseAmount">Min Purchase Amount (₹)</Label>
              <Controller
                name="minPurchaseAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="minPurchaseAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={cn(errors.minPurchaseAmount && 'border-red-500')}
                  />
                )}
              />
              {errors.minPurchaseAmount && (
                <p className="text-sm text-red-500">{errors.minPurchaseAmount.message}</p>
              )}
            </div>

            {/* Max Discount Amount (only for percentage) */}
            {discountType === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
                <Controller
                  name="maxDiscountAmount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={cn(errors.maxDiscountAmount && 'border-red-500')}
                    />
                  )}
                />
                {errors.maxDiscountAmount && (
                  <p className="text-sm text-red-500">{errors.maxDiscountAmount.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="startDate"
                    type="date"
                    className={cn(errors.startDate && 'border-red-500')}
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="endDate"
                    type="date"
                    className={cn(errors.endDate && 'border-red-500')}
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Usage Limit */}
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
            <Controller
              name="usageLimit"
              control={control}
              render={({ field }) => (
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="Enter usage limit"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className={cn(errors.usageLimit && 'border-red-500')}
                />
              )}
            />
            {errors.usageLimit && (
              <p className="text-sm text-red-500">{errors.usageLimit.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              {mode === 'create' ? 'Create Discount' : 'Update Discount'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DiscountForm
