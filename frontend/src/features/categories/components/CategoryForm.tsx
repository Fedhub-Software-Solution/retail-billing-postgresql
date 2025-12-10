import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../store/api/categoryApi'
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

const categorySchema = yup.object({
  name: yup.string().required('Category name is required').max(100, 'Name must be less than 100 characters'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  parentId: yup.number().nullable(),
})

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void
  category?: Category
  categories?: Category[]
  mode: 'create' | 'edit'
}

const CategoryForm = ({
  open,
  onClose,
  onSubmit,
  category,
  categories = [],
  mode,
}: CategoryFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: null as number | null,
    },
  })

  useEffect(() => {
    if (category && mode === 'edit') {
      reset({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || null,
      })
    } else {
      reset({
        name: '',
        description: '',
        parentId: null,
      })
    }
  }, [category, mode, reset, open])

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
    reset()
  }

  // Flatten categories for dropdown (excluding current category if editing)
  const flatCategories = (cats: Category[], excludeId?: number): Array<{ id: number; name: string; level: number }> => {
    const result: Array<{ id: number; name: string; level: number }> = []
    
    const flatten = (items: Category[], level: number) => {
      items.forEach((item) => {
        if (item.id !== excludeId) {
          result.push({ id: item.id, name: '  '.repeat(level) + item.name, level })
          if (item.children && item.children.length > 0) {
            flatten(item.children, level + 1)
          }
        }
      })
    }
    
    flatten(cats, 0)
    return result
  }

  const categoryOptions = flatCategories(categories, mode === 'edit' ? category?.id : undefined)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create Category' : 'Edit Category'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new category to organize your products'
              : 'Update category information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="Enter category name"
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
                  placeholder="Enter category description"
                  rows={3}
                  className={cn(errors.description && 'border-red-500')}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Category (Optional)</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}
                >
                  <SelectTrigger id="parentId" className={cn(errors.parentId && 'border-red-500')}>
                    <SelectValue placeholder="None (Root Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.parentId && (
              <p className="text-sm text-red-500">{errors.parentId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              {mode === 'create' ? 'Create Category' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryForm
