import { useState } from 'react'
import { Plus, Grid3x3, Search } from 'lucide-react'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../store/api/categoryApi'
import CategoryTree from '../components/CategoryTree'
import CategoryForm from '../components/CategoryForm'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent } from '../../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'

const CategoriesPage = () => {
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery()
  const [createCategory] = useCreateCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreate = () => {
    setFormMode('create')
    setSelectedCategory(null)
    setFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setFormMode('edit')
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      if (formMode === 'create') {
        await createCategory(data as CreateCategoryRequest).unwrap()
      } else if (selectedCategory) {
        await updateCategory({
          id: selectedCategory.id,
          data: data as UpdateCategoryRequest,
        }).unwrap()
      }
      setFormOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory(selectedCategory.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedCategory(null)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return <LoadingSpinner message="Loading categories..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Categories"
        message="Failed to load categories. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Categories
          </h2>
          <p className="text-gray-500 mt-1">Manage your product categories</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tree */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          {filteredCategories.length === 0 ? (
            <EmptyState
              icon={Grid3x3}
              title="No categories found"
              description={searchTerm ? "Try adjusting your search term" : "Get started by adding your first category"}
              actionLabel={searchTerm ? undefined : "Add Category"}
              onAction={searchTerm ? undefined : handleCreate}
            />
          ) : (
            <CategoryTree
              categories={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <CategoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedCategory(null)
        }}
        onSubmit={handleFormSubmit}
        category={selectedCategory || undefined}
        categories={categories}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be
              undone.
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ This category has subcategories. Please delete or move them first.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={selectedCategory?.children && selectedCategory.children.length > 0}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CategoriesPage
