import { User, ShoppingCart } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Customer } from '../../../store/api/customerApi'

interface BillSummaryProps {
  selectedCustomer?: Customer | null
  subtotal: number
  discountAmount: number
  tax: number
  total: number
  discountCode: string
  manualDiscount: number
  appliedDiscountInfo: { name: string; type: 'percentage' | 'fixed'; value: number; maxDiscountAmount?: number } | null
  applyingDiscount: boolean
  onDiscountCodeChange: (code: string) => void
  onApplyDiscount: () => void
  onManualDiscountChange: (percentage: number) => void
  onCompleteSale: () => void
  cartItemsCount: number
}

export const BillSummary = ({
  selectedCustomer,
  subtotal,
  discountAmount,
  tax,
  total,
  discountCode,
  manualDiscount,
  appliedDiscountInfo,
  applyingDiscount,
  onDiscountCodeChange,
  onApplyDiscount,
  onManualDiscountChange,
  onCompleteSale,
  cartItemsCount,
}: BillSummaryProps) => {
  return (
    <div className="w-80 min-w-[280px] max-w-[400px] bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 px-3 py-3 border-l border-purple-200 flex flex-col flex-shrink-0">
      {/* Customer Info */}
      {selectedCustomer && (
        <div className="mb-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-purple-100">Customer</p>
              <p className="text-white font-medium text-sm">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </p>
            </div>
          </div>
          {selectedCustomer.phone && (
            <div className="flex items-center gap-2 text-purple-100 text-xs">
              <span>{selectedCustomer.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Bill Summary Heading */}
      <h2 className="text-lg text-gray-900 mb-2 font-semibold">Bill Summary</h2>

      {/* Summary Rows */}
      <div className="space-y-2 mb-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">Subtotal:</span>
          <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">Discount:</span>
          <span className="text-gray-900 font-medium">-₹{discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">Tax:</span>
          <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-purple-300">
        <span className="text-base text-gray-900 font-semibold">Total:</span>
        <span className="text-xl text-blue-600 font-bold">₹{total.toFixed(2)}</span>
      </div>

      {/* Discount Code */}
      <div className="mb-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Discount Code"
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button
            onClick={onApplyDiscount}
            disabled={applyingDiscount || !discountCode.trim()}
            size="sm"
            variant="outline"
          >
            {applyingDiscount ? '...' : 'APPLY'}
          </Button>
        </div>
        {appliedDiscountInfo && (
          <p className="text-xs text-green-600 mt-1">
            Applied: {appliedDiscountInfo.name} ({appliedDiscountInfo.type === 'percentage' ? `${appliedDiscountInfo.value}%` : `₹${appliedDiscountInfo.value}`})
          </p>
        )}
      </div>

      {/* Manual Discount Amount (%) */}
      <div className="mb-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={manualDiscount || ''}
          onChange={(e) => onManualDiscountChange(parseFloat(e.target.value) || 0)}
          placeholder="Manual Discount Value"
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-0.5">Enter discount percentage (0-100%)</p>
      </div>

      {/* Complete Sale Button */}
      <Button
        onClick={onCompleteSale}
        disabled={cartItemsCount === 0}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        COMPLETE SALE
      </Button>
    </div>
  )
}

