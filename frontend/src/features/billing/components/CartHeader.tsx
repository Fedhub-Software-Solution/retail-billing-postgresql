import { ShoppingCart } from 'lucide-react'

export const CartHeader = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-6 py-4 border-b-2 border-purple-700 flex-shrink-0 shadow-lg">
      <div className="grid grid-cols-12 gap-4 text-white text-sm font-semibold">
        <div className="col-span-4 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Item Details
        </div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-center">Total</div>
        <div className="col-span-2 text-center">Action</div>
      </div>
    </div>
  )
}

