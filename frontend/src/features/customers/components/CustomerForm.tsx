import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../../store/api/customerApi'
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
import { Textarea } from '../../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { cn } from '../../../lib/utils'

const customerSchema = yup.object({
  firstName: yup.string().required('First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: yup.string().max(50, 'Last name must be less than 50 characters'),
  email: yup.string().email('Invalid email address').max(100, 'Email must be less than 100 characters'),
  phone: yup.string().max(20, 'Phone must be less than 20 characters'),
  address: yup.string().max(500, 'Address must be less than 500 characters'),
  city: yup.string().max(50, 'City must be less than 50 characters'),
  state: yup.string().max(50, 'State must be less than 50 characters'),
  zipCode: yup.string().max(20, 'Zip code must be less than 20 characters'),
  country: yup.string().max(50).default('India'),
  customerType: yup.string().oneOf(['retail', 'wholesale', 'corporate']).default('retail'),
  creditLimit: yup.number().min(0, 'Credit limit cannot be negative').default(0),
})

interface CustomerFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => void
  customer?: Customer
  mode: 'create' | 'edit'
}

const CustomerForm = ({ open, onClose, onSubmit, customer, mode }: CustomerFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      customerType: 'retail',
      creditLimit: 0,
    },
  })

  useEffect(() => {
    if (customer && mode === 'edit') {
      reset({
        firstName: customer.firstName,
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country,
        customerType: customer.customerType,
        creditLimit: customer.creditLimit,
      })
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        customerType: 'retail',
        creditLimit: 0,
      })
    }
  }, [customer, mode, reset, open])

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create Customer' : 'Edit Customer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new customer to your database'
              : 'Update customer information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="firstName"
                    placeholder="Enter first name"
                    className={cn(errors.firstName && 'border-red-500')}
                  />
                )}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="lastName"
                    placeholder="Enter last name"
                    className={cn(errors.lastName && 'border-red-500')}
                  />
                )}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    className={cn(errors.email && 'border-red-500')}
                  />
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phone"
                    placeholder="Enter phone number"
                    className={cn(errors.phone && 'border-red-500')}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="address"
                  placeholder="Enter address"
                  rows={2}
                  className={cn(errors.address && 'border-red-500')}
                />
              )}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="city"
                    placeholder="Enter city"
                    className={cn(errors.city && 'border-red-500')}
                  />
                )}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="state"
                    placeholder="Enter state"
                    className={cn(errors.state && 'border-red-500')}
                  />
                )}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Controller
                name="zipCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="zipCode"
                    placeholder="Enter zip code"
                    className={cn(errors.zipCode && 'border-red-500')}
                  />
                )}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="country"
                    placeholder="Enter country"
                    className={cn(errors.country && 'border-red-500')}
                  />
                )}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Customer Type */}
            <div className="space-y-2">
              <Label htmlFor="customerType">Customer Type</Label>
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customerType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerType && (
                <p className="text-sm text-red-500">{errors.customerType.message}</p>
              )}
            </div>

            {/* Credit Limit */}
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <Controller
                name="creditLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={cn(errors.creditLimit && 'border-red-500')}
                  />
                )}
              />
              {errors.creditLimit && (
                <p className="text-sm text-red-500">{errors.creditLimit.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              {mode === 'create' ? 'Create Customer' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerForm
