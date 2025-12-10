import { useState } from 'react'
import { Eye, Edit, Trash2, Calendar, TrendingUp, Plus, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useGetSalesQuery,
  useCancelSaleMutation,
  Sale,
  SaleQueryParams,
} from '../../../store/api/saleApi'
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

const SalesPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const queryParams: SaleQueryParams = {
    page,
    limit,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
  }

  const { data, isLoading, error } = useGetSalesQuery(queryParams)
  const [cancelSale] = useCancelSaleMutation()

  const handleView = (sale: Sale) => {
    navigate(`/sales/${sale.id}`)
  }

  const handleEdit = (sale: Sale, e?: React.MouseEvent) => {
    e?.stopPropagation()
    // Navigate to sale detail page where editing can be done
    navigate(`/sales/${sale.id}?edit=true`)
  }

  const handleDelete = (sale: Sale, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedSale(sale)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedSale) {
      try {
        await cancelSale(selectedSale.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedSale(null)
      } catch (error) {
        console.error('Error deleting sale:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading sales..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Sales"
        message="Failed to load sales. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  const sales = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  // Calculate summary statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalSales = sales.length
  const paidSales = sales.filter((s) => s.paymentStatus === 'paid').length
  const pendingSales = sales.filter((s) => s.paymentStatus === 'pending').length

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'partial':
        return <Badge variant="warning">Partial</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Sales
          </h2>
          <p className="text-gray-500 mt-1">View and manage all sales transactions</p>
        </div>
        <Button onClick={() => navigate('/billing')} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Sale
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Sales</p>
                <p className="text-2xl font-bold text-gray-900">{paidSales}</p>
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
                <p className="text-sm text-gray-600 mb-1">Pending Sales</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSales}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Payment Status</label>
              <Select
                value={paymentStatusFilter}
                onValueChange={(value) => {
                  setPaymentStatusFilter(value === 'all' ? '' : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setPaymentStatusFilter('')
                  setPage(1)
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="border border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Subtotal</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Tax</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Discount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12">
                      <EmptyState
                        icon={TrendingUp}
                        title="No sales found"
                        description={
                          startDate || endDate || paymentStatusFilter
                            ? 'Try adjusting your filters to see more results'
                            : 'Start making sales to see them here'
                        }
                        iconSize="md"
                      />
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleView(sale)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{sale.invoiceNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{sale.customerName || 'Walk-in'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-gray-900">₹{sale.subtotal.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-gray-900">₹{sale.taxAmount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-gray-900">₹{sale.discountAmount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-purple-600">
                          ₹{sale.totalAmount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">{getPaymentStatusBadge(sale.paymentStatus)}</td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(sale)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Sale"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEdit(sale, e)}
                            disabled={sale.paymentStatus === 'paid' || sale.paymentStatus === 'cancelled'}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={sale.paymentStatus === 'paid' || sale.paymentStatus === 'cancelled' ? 'Cannot edit paid or cancelled sales' : 'Edit Sale'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDelete(sale, e)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Sale"
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
          itemName="sales"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sale</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete sale {selectedSale?.invoiceNumber}? This action
              cannot be undone and will restore product stock quantities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalesPage
