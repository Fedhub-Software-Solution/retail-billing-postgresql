import { User, UserPlus } from 'lucide-react'
import { Customer } from '../../../store/api/customerApi'
import { cn } from '../../../lib/utils'

interface CustomerSearchProps {
  customers: Customer[]
  searchTerm: string
  onSelectCustomer: (customer: Customer) => void
  onAddNewCustomer: () => void
  onClose: () => void
}

export const CustomerSearch = ({
  customers,
  searchTerm,
  onSelectCustomer,
  onAddNewCustomer,
  onClose,
}: CustomerSearchProps) => {
  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
      {filteredCustomers.length > 0 ? (
        <>
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                onSelectCustomer(customer)
                onClose()
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {customer.phone || customer.email || customer.customerCode}
                </p>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              onAddNewCustomer()
              onClose()
            }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors border-t-2 border-purple-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-purple-600">Add New Customer</p>
            </div>
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            onAddNewCustomer()
            onClose()
          }}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-purple-600">Add New Customer</p>
            <p className="text-xs text-gray-500">No customer found. Create a new one.</p>
          </div>
        </button>
      )}
    </div>
  )
}

