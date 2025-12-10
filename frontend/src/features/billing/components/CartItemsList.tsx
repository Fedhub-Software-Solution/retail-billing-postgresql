import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { CartItem } from '../../../store/slices/cartSlice'

interface CartItemsListProps {
  items: CartItem[]
  onQuantityChange: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
}

export const CartItemsList = ({ items, onQuantityChange, onRemoveItem }: CartItemsListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <ShoppingCart className="w-16 h-16 text-purple-400" />
        </div>
        <p className="text-gray-500 text-xl mb-2">Your cart is empty</p>
        <p className="text-gray-400 text-sm">Search and add products to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const itemTotal = item.unitPrice * item.quantity
        const itemTax = (itemTotal * item.taxRate) / 100

        return (
          <div
            key={item.productId}
            className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-purple-300"
          >
            <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 px-4 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Item Name */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs shadow-md flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate group-hover:text-purple-700 transition-colors font-medium">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.sku}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <span className="text-sm text-green-700">₹{item.unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        onQuantityChange(item.productId, Math.max(1, value))
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-16 h-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                    <span className="text-sm text-blue-700">₹{itemTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="col-span-2 text-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveItem(item.productId)}
                    className="w-9 h-9 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

