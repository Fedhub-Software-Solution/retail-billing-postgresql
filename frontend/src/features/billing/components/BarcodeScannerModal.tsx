import { useState, useEffect, useRef } from 'react'
import { Scan, Keyboard, Camera, Lightbulb, Package } from 'lucide-react'
import { useGetProductsQuery } from '../../../store/api/productApi'
import { Product } from '../../../store/api/productApi'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'

interface BarcodeScannerModalProps {
  open: boolean
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export const BarcodeScannerModal = ({
  open,
  onClose,
  onSelectProduct,
}: BarcodeScannerModalProps) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'camera'>('manual')
  const [barcode, setBarcode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Search products by barcode or SKU
  const { data: productsData, isLoading } = useGetProductsQuery({
    search: searchTerm,
    limit: 10,
    page: 1,
  })

  const products = productsData?.data || []

  // Filter products that have barcodes or match SKU exactly
  const filteredProducts = products.filter(
    (product) =>
      (product.barcode && product.barcode.toLowerCase() === searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase() === searchTerm.toLowerCase()
  )

  // Count products with barcodes
  const productsWithBarcodes = products.filter((p) => p.barcode && p.barcode.trim() !== '').length

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Clear search when modal closes
  useEffect(() => {
    if (!open) {
      setBarcode('')
      setSearchTerm('')
    }
  }, [open])

  const handleBarcodeChange = (value: string) => {
    setBarcode(value)
    setSearchTerm(value)
  }

  const handleFindProduct = () => {
    if (!barcode.trim()) {
      return
    }

    // If exact match found, add to cart
    if (filteredProducts.length === 1) {
      handleSelectProduct(filteredProducts[0])
    } else if (filteredProducts.length > 1) {
      // Multiple matches - let user select
      // For now, just take the first one
      handleSelectProduct(filteredProducts[0])
    }
  }

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product)
    setBarcode('')
    setSearchTerm('')
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFindProduct()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Barcode Scanner</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Scan or enter product barcode
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Input Method Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={inputMethod === 'manual' ? 'default' : 'outline'}
              className={`flex-1 ${
                inputMethod === 'manual'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  : ''
              }`}
              onClick={() => setInputMethod('manual')}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button
              type="button"
              variant={inputMethod === 'camera' ? 'default' : 'outline'}
              className={`flex-1 ${
                inputMethod === 'camera'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  : ''
              }`}
              onClick={() => {
                setInputMethod('camera')
                // TODO: Implement camera scanning
                alert('Camera scanning feature coming soon!')
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera Scan
            </Button>
          </div>

          {/* Barcode Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-gray-500" />
              <Label htmlFor="barcode" className="text-sm font-medium">
                Enter Barcode or SKU
              </Label>
            </div>
            <Input
              ref={inputRef}
              id="barcode"
              type="text"
              placeholder="Type or scan barcode here..."
              value={barcode}
              onChange={(e) => handleBarcodeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-lg"
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lightbulb className="w-3 h-3" />
              <span>Tip: Use a USB barcode scanner for instant scanning</span>
            </div>
          </div>

          {/* Product Results */}
          {barcode.trim() && (
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">Searching...</div>
              ) : filteredProducts.length > 0 ? (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-2">Found {filteredProducts.length} product(s):</p>
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="w-full p-2 flex items-center gap-3 hover:bg-white rounded-lg transition-colors text-left border border-transparent hover:border-purple-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.barcode && `Barcode: ${product.barcode}`}
                          {product.barcode && product.sku && ' • '}
                          {product.sku && `SKU: ${product.sku}`}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">
                          ₹{product.unitPrice.toFixed(2)} • Stock: {product.stockQuantity} {product.unit}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-sm text-gray-500 text-center">
                    No product found with barcode/SKU: <strong>{barcode}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Find Product Button */}
          <Button
            onClick={handleFindProduct}
            disabled={!barcode.trim() || isLoading || filteredProducts.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            size="lg"
          >
            <Scan className="w-5 h-5 mr-2" />
            Find Product
          </Button>

          {/* Info Message */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-700 text-center">
              {productsWithBarcodes} product{productsWithBarcodes !== 1 ? 's' : ''} have barcode{productsWithBarcodes !== 1 ? 's' : ''} in your catalog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

