import { Search, Scan, User, UserPlus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { ProductSearch } from './ProductSearch'
import { CustomerSearch } from './CustomerSearch'
import { Product } from '../../../store/api/productApi'
import { Customer } from '../../../store/api/customerApi'

interface BillingHeaderProps {
  searchItem: string
  onSearchItemChange: (value: string) => void
  products: Product[]
  onSelectProduct: (product: Product) => void
  onBarcodeScanClick: () => void
  customerName: string
  onCustomerNameChange: (value: string) => void
  showCustomerDropdown: boolean
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onAddNewCustomer: () => void
  onCloseCustomerDropdown: () => void
  billNumber: string
}

export const BillingHeader = ({
  searchItem,
  onSearchItemChange,
  products,
  onSelectProduct,
  onBarcodeScanClick,
  customerName,
  onCustomerNameChange,
  showCustomerDropdown,
  customers,
  onSelectCustomer,
  onAddNewCustomer,
  onCloseCustomerDropdown,
  billNumber,
}: BillingHeaderProps) => {
  return (
    <div className="bg-white px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Left Side - Search Item */}
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search Item..."
              value={searchItem}
              onChange={(e) => onSearchItemChange(e.target.value)}
              className="w-full"
            />
            {searchItem.length > 0 && products.length > 0 && (
              <ProductSearch
                products={products}
                searchTerm={searchItem}
                onSelectProduct={onSelectProduct}
                onClose={() => onSearchItemChange('')}
              />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBarcodeScanClick}
            className="h-10 w-10 p-0 border-green-300 hover:bg-green-50 hover:border-green-400"
            title="Scan Barcode"
          >
            <Scan className="w-5 h-5 text-green-600" />
          </Button>
        </div>

        {/* Right Side - Customer Search */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Search by Name or Phone Number..."
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="w-full"
            />
            {showCustomerDropdown && (
              <CustomerSearch
                customers={customers}
                searchTerm={customerName}
                onSelectCustomer={onSelectCustomer}
                onAddNewCustomer={() => {
                  onAddNewCustomer()
                  onCloseCustomerDropdown()
                }}
                onClose={onCloseCustomerDropdown}
              />
            )}
          </div>
          <Button
            size="sm"
            onClick={onAddNewCustomer}
            className="w-10 h-10 p-0"
          >
            <UserPlus className="w-5 h-5" />
          </Button>
          <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm flex-shrink-0">
            {billNumber}
          </div>
        </div>
      </div>
    </div>
  )
}

