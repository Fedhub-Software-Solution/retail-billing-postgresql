import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Package, IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react'
import { useGetProductByIdQuery } from '../../../store/api/productApi'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import { cn } from '../../../lib/utils'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useGetProductByIdQuery(Number(id))

  if (isLoading) {
    return <LoadingSpinner message="Loading product details..." />
  }

  if (error || !product) {
    return (
      <ErrorState
        title="Product Not Found"
        message="The product you're looking for doesn't exist or an error occurred."
        onRetry={() => navigate('/products')}
      />
    )
  }

  const getStockStatus = () => {
    if (product.stockQuantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' }
    }
    if (product.stockQuantity <= product.minStockLevel) {
      return { label: 'Low Stock', variant: 'warning' as const, color: 'text-orange-600' }
    }
    return { label: 'In Stock', variant: 'success' as const, color: 'text-green-600' }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/products')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <Button
          onClick={() => {
            // Navigate to edit or open edit form
            navigate(`/products`)
          }}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Product
        </Button>
      </div>

      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {product.name}
        </h1>
        <p className="text-gray-500">SKU: {product.sku}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.barcode && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Barcode</p>
                    <p className="text-base font-medium text-gray-900">{product.barcode}</p>
                  </div>
                )}
                {product.categoryName && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="text-base font-medium text-gray-900">{product.categoryName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unit</p>
                  <p className="text-base font-medium text-gray-900">{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={product.isActive ? 'success' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {product.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-base text-gray-900">{product.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unit Price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {product.unitPrice.toFixed(2)}
                    </p>
                    {product.taxRate > 0 && (
                      <span className="text-xs text-gray-500">+ {product.taxRate}% tax</span>
                    )}
                  </div>
                </div>

                {product.costPrice && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cost Price</p>
                    <p className="text-lg font-medium text-gray-900">
                      ₹{product.costPrice.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Stock Quantity</p>
                  <div className="flex items-center justify-between">
                    <p className={cn('text-2xl font-bold', stockStatus.color)}>
                      {product.stockQuantity} {product.unit}
                    </p>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Min Stock Level: {product.minStockLevel} {product.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/billing')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/inventory')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
