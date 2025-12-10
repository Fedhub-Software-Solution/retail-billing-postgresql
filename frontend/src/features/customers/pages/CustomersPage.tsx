import { useState } from 'react'
import { Plus, Edit, Trash2, Users, Search, Eye, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useGetCustomersQuery,
  useGetCustomerStatisticsQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
} from '../../../store/api/customerApi'
import CustomerForm from '../components/CustomerForm'
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
import { Pagination } from '../../../components/common/Pagination'

const CustomersPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('')

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const queryParams: CustomerQueryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(customerTypeFilter && { customerType: customerTypeFilter }),
  }

  const { data, isLoading, error } = useGetCustomersQuery(queryParams)
  const { data: statistics } = useGetCustomerStatisticsQuery()
  const [createCustomer] = useCreateCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()
  const [deleteCustomer] = useDeleteCustomerMutation()

  const handleCreate = () => {
    setFormMode('create')
    setSelectedCustomer(null)
    setFormOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setFormMode('edit')
    setSelectedCustomer(customer)
    setFormOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDeleteDialogOpen(true)
  }

  const handleView = (customer: Customer) => {
    navigate(`/customers/${customer.id}`)
  }

  const handleFormSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    try {
      if (formMode === 'create') {
        await createCustomer(data as CreateCustomerRequest).unwrap()
      } else if (selectedCustomer) {
        await updateCustomer({
          id: selectedCustomer.id,
          data: data as UpdateCustomerRequest,
        }).unwrap()
      }
      setFormOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedCustomer) {
      try {
        await deleteCustomer(selectedCustomer.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedCustomer(null)
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading customers..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Customers"
        message="Failed to load customers. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  const customers = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const getCustomerTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'retail':
        return <Badge variant="retail">{type}</Badge>
      case 'wholesale':
        return <Badge variant="wholesale">{type}</Badge>
      case 'corporate':
      case 'vip':
        return <Badge variant="vip">{type}</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Customers
          </h2>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.activeCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{statistics.totalPurchases.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Purchase Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{statistics.averagePurchaseValue.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, phone, or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={customerTypeFilter}
              onValueChange={(value) => {
                setCustomerTypeFilter(value === 'all' ? '' : value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total Purchases</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Credit Limit</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <EmptyState
                        icon={Users}
                        title="No customers found"
                        description={
                          search || customerTypeFilter
                            ? 'Try adjusting your search or filters to see more results'
                            : 'Get started by adding your first customer'
                        }
                        actionLabel={search || customerTypeFilter ? undefined : 'Add Customer'}
                        onAction={search || customerTypeFilter ? undefined : handleCreate}
                        iconSize="md"
                      />
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleView(customer)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{customer.customerCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {customer.email && (
                            <p className="text-sm text-gray-900">{customer.email}</p>
                          )}
                          {customer.phone && (
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          )}
                          {!customer.email && !customer.phone && (
                            <p className="text-xs text-gray-400">No contact info</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getCustomerTypeBadge(customer.customerType)}</td>
                      <td className="px-6 py-4 text-right">
                        {customer.totalPurchases ? (
                          <p className="text-sm font-medium text-purple-600">
                            ₹{customer.totalPurchases.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">₹0.00</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-gray-900">₹{customer.creditLimit.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={customer.isActive ? 'active' : 'inactive'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(customer)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setPage}
          itemName="customers"
        />
      )}

      {/* Customer Form Modal */}
      <CustomerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedCustomer(null)
        }}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer || undefined}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCustomer?.firstName}{' '}
              {selectedCustomer?.lastName}"? This action cannot be undone.
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

export default CustomersPage
