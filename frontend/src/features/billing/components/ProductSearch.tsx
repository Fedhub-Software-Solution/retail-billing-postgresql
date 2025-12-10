import { Search, Package } from 'lucide-react'
import { Product } from '../../../store/api/productApi'
import { cn } from '../../../lib/utils'

interface ProductSearchProps {
  products: Product[]
  searchTerm: string
  onSelectProduct: (product: Product) => void
  onClose: () => void
}

export const ProductSearch = ({ products, searchTerm, onSelectProduct, onClose }: ProductSearchProps) => {
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (filteredProducts.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
      {filteredProducts.map((product) => (
        <button
          key={product.id}
          onClick={() => {
            onSelectProduct(product)
            onClose()
          }}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">
              {product.sku} | ₹{product.unitPrice.toFixed(2)} | Stock: {product.stockQuantity}
            </p>
          </div>
          <div className="text-sm text-purple-600 font-medium">Add</div>
        </button>
      ))}
    </div>
  )
}

