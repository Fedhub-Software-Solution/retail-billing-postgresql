import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../store/api/productApi'
import { useGetCategoriesFlatQuery } from '../../../store/api/categoryApi'
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

const productSchema = yup.object({
  sku: yup.string().required('SKU is required').max(50, 'SKU must be less than 50 characters'),
  name: yup.string().required('Product name is required').max(200, 'Name must be less than 200 characters'),
  description: yup.string().max(1000, 'Description must be less than 1000 characters'),
  categoryId: yup.number().nullable(),
  barcode: yup.string().max(100, 'Barcode must be less than 100 characters'),
  unitPrice: yup.number().positive('Price must be positive').required('Price is required'),
  costPrice: yup.number().positive('Cost price must be positive').nullable(),
  stockQuantity: yup.number().integer().min(0, 'Stock cannot be negative').default(0),
  minStockLevel: yup.number().integer().min(0, 'Min stock level cannot be negative').default(0),
  unit: yup.string().max(20).default('pcs'),
  taxRate: yup.number().min(0).max(100, 'Tax rate cannot exceed 100%').default(0),
})

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void
  product?: Product
  mode: 'create' | 'edit'
}

const ProductForm = ({ open, onClose, onSubmit, product, mode }: ProductFormProps) => {
  const { data: categories = [] } = useGetCategoriesFlatQuery()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      categoryId: null as number | null,
      barcode: '',
      unitPrice: 0,
      costPrice: null as number | null,
      stockQuantity: 0,
      minStockLevel: 0,
      unit: 'pcs',
      taxRate: 0,
    },
  })

  useEffect(() => {
    if (product && mode === 'edit') {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId || null,
        barcode: product.barcode || '',
        unitPrice: product.unitPrice,
        costPrice: product.costPrice || null,
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        unit: product.unit,
        taxRate: product.taxRate,
      })
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        categoryId: null,
        barcode: '',
        unitPrice: 0,
        costPrice: null,
        stockQuantity: 0,
        minStockLevel: 0,
        unit: 'pcs',
        taxRate: 0,
      })
    }
  }, [product, mode, reset, open])

  const handleFormSubmit = (data: any) => {
    // Remove SKU from update request if editing
    if (mode === 'edit') {
      const { sku, ...updateData } = data
      onSubmit(updateData)
    } else {
      onSubmit(data)
    }
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new product to your inventory'
              : 'Update product information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="sku"
                    placeholder="Enter SKU"
                    disabled={mode === 'edit'}
                    className={cn(errors.sku && 'border-red-500')}
                  />
                )}
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Controller
                name="barcode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="barcode"
                    placeholder="Enter barcode"
                    className={cn(errors.barcode && 'border-red-500')}
                  />
                )}
              />
              {errors.barcode && (
                <p className="text-sm text-red-500">{errors.barcode.message}</p>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="Enter product name"
                  className={cn(errors.name && 'border-red-500')}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                  className={cn(errors.description && 'border-red-500')}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger id="categoryId" className={cn(errors.categoryId && 'border-red-500')}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="g">Gram</SelectItem>
                      <SelectItem value="l">Liter</SelectItem>
                      <SelectItem value="ml">Milliliter</SelectItem>
                      <SelectItem value="m">Meter</SelectItem>
                      <SelectItem value="cm">Centimeter</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">
                Unit Price <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={cn(errors.unitPrice && 'border-red-500')}
                  />
                )}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
              )}
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Controller
                name="costPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className={cn(errors.costPrice && 'border-red-500')}
                  />
                )}
              />
              {errors.costPrice && (
                <p className="text-sm text-red-500">{errors.costPrice.message}</p>
              )}
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Controller
                name="taxRate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={cn(errors.taxRate && 'border-red-500')}
                  />
                )}
              />
              {errors.taxRate && (
                <p className="text-sm text-red-500">{errors.taxRate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Controller
                name="stockQuantity"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="stockQuantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={cn(errors.stockQuantity && 'border-red-500')}
                  />
                )}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-500">{errors.stockQuantity.message}</p>
              )}
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Controller
                name="minStockLevel"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="minStockLevel"
                    type="number"
                    min="0"
                    placeholder="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={cn(errors.minStockLevel && 'border-red-500')}
                  />
                )}
              />
              {errors.minStockLevel && (
                <p className="text-sm text-red-500">{errors.minStockLevel.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              {mode === 'create' ? 'Create Product' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductForm
