import { useState } from 'react'
import { Plus, Edit, Trash2, Package, Search, Eye, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from '../../../store/api/productApi'
import { useGetCategoriesFlatQuery } from '../../../store/api/categoryApi'
import ProductForm from '../components/ProductForm'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { cn } from '../../../lib/utils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'

const ProductsPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const queryParams: ProductQueryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(categoryFilter && { categoryId: categoryFilter as number }),
    sortBy,
    order: sortOrder,
  }

  const { data, isLoading, error } = useGetProductsQuery(queryParams)
  const { data: categories = [] } = useGetCategoriesFlatQuery()
  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const handleCreate = () => {
    setFormMode('create')
    setSelectedProduct(null)
    setFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setFormMode('edit')
    setSelectedProduct(product)
    setFormOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleView = (product: Product) => {
    navigate(`/products/${product.id}`)
  }

  const handleFormSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (formMode === 'create') {
        await createProduct(data as CreateProductRequest).unwrap()
      } else if (selectedProduct) {
        await updateProduct({
          id: selectedProduct.id,
          data: data as UpdateProductRequest,
        }).unwrap()
      }
      setFormOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedProduct(null)
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading products..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Products"
        message="Failed to load products. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  const products = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const }
    if (product.stockQuantity <= product.minStockLevel)
      return { label: 'Low Stock', variant: 'warning' as const }
    return { label: 'In Stock', variant: 'success' as const }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Products ({pagination.total})
            </h2>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter.toString()}
              onValueChange={(value) => {
                setCategoryFilter(value === 'all' ? '' : (parseInt(value) as number))
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="sku">SKU</SelectItem>
                <SelectItem value="unit_price">Price</SelectItem>
                <SelectItem value="stock_quantity">Stock</SelectItem>
                <SelectItem value="created_at">Date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            search || categoryFilter
              ? 'Try adjusting your search or filters to see more results'
              : 'Get started by adding your first product'
          }
          actionLabel={search || categoryFilter ? undefined : 'Add Product'}
          onAction={search || categoryFilter ? undefined : handleCreate}
        />
      ) : (
        <Card className="border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* Product Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-4 py-3">
                          {product.categoryName ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {product.categoryName}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        {/* Price Column */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-green-600">
                            INR{product.unitPrice.toFixed(2)}
                          </span>
                        </td>

                        {/* Stock Column */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-green-600">
                            {product.stockQuantity}
                          </span>
                        </td>

                        {/* Unit Column */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{product.unit}</span>
                        </td>

                        {/* Discount Column */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-400">-</span>
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={stockStatus.variant}
                            className={
                              stockStatus.variant === 'success'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : stockStatus.variant === 'warning'
                                ? 'bg-orange-100 text-orange-700 border-orange-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {stockStatus.label}
                          </Badge>
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{' '}
            {pagination.total} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleFormSubmit}
        product={selectedProduct || undefined}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsPage
