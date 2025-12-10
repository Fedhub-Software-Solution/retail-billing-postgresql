import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, TrendingUp, IndianRupee } from 'lucide-react'
import { useGetCustomerByIdQuery, useGetCustomerSalesQuery } from '../../../store/api/customerApi'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import { cn } from '../../../lib/utils'

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useGetCustomerByIdQuery(Number(id))
  const { data: sales = [] } = useGetCustomerSalesQuery(Number(id), { skip: !customer })

  if (isLoading) {
    return <LoadingSpinner message="Loading customer details..." />
  }

  if (error || !customer) {
    return (
      <ErrorState
        title="Customer Not Found"
        message="The customer you're looking for doesn't exist or an error occurred."
        onRetry={() => navigate('/customers')}
      />
    )
  }

  const getCustomerTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'retail':
        return <Badge variant="retail">{type}</Badge>
      case 'wholesale':
        return <Badge variant="wholesale">{type}</Badge>
      case 'corporate':
        return <Badge variant="corporate">{type}</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'partial':
        return <Badge variant="warning">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/customers')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Button>
        <Button
          onClick={() => {
            // Navigate to edit or open edit form
            navigate(`/customers`)
          }}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Customer
        </Button>
      </div>

      {/* Customer Title */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-gray-500">Code: {customer.customerCode}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-base font-medium text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="text-base font-medium text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-base text-gray-900">
                        {customer.address}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.zipCode && ` ${customer.zipCode}`}
                        {customer.country && `, ${customer.country}`}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                  {getCustomerTypeBadge(customer.customerType)}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales History */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Sales History</h2>
                <Badge variant="secondary">{sales.length} sales</Badge>
              </div>
              {sales.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No sales history"
                  description="This customer hasn't made any purchases yet"
                  iconSize="md"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Invoice
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Payment Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sales.map((sale: any) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{sale.invoice_number}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">
                              {new Date(sale.sale_date).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-medium text-purple-600 flex items-center justify-end gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {parseFloat(sale.total_amount).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">{getPaymentStatusBadge(sale.payment_status)}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-600">{sale.payment_method || '-'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
                  <p className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {customer.totalPurchases?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Credit Limit</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{customer.creditLimit.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPage
