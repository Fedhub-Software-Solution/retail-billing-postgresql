import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt, IndianRupee, Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useGetSaleByIdQuery, useGetSalePaymentsQuery } from '../../../store/api/saleApi'
import PaymentDialog from '../components/PaymentDialog'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import { cn } from '../../../lib/utils'

const SaleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sale, isLoading, error } = useGetSaleByIdQuery(Number(id))
  const { data: payments = [] } = useGetSalePaymentsQuery(Number(id), { skip: !sale })

  if (isLoading) {
    return <LoadingSpinner message="Loading sale details..." />
  }

  if (error || !sale) {
    return (
      <ErrorState
        title="Sale Not Found"
        message="The sale you're looking for doesn't exist or an error occurred."
        onRetry={() => navigate('/sales')}
      />
    )
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = sale.totalAmount - totalPaid

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Pending
          </Badge>
        )
      case 'partial':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Partial
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/sales')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Sales
        </Button>
        {remaining > 0 && sale.paymentStatus !== 'cancelled' && (
          <PaymentDialog saleId={sale.id} remainingAmount={remaining} />
        )}
      </div>

      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Invoice: {sale.invoiceNumber}</h1>
                <p className="text-purple-100 text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(sale.saleDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            {getPaymentStatusBadge(sale.paymentStatus)}
            <p className="text-3xl font-bold mt-2 flex items-center justify-end gap-1">
              <IndianRupee className="w-6 h-6" />
              {sale.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sale Items */}
          <Card className="border border-gray-100">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Sale Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Qty</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Discount</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Tax</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sale.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">₹{item.unitPrice.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm text-gray-900">{item.quantity}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">₹{(item.discountAmount || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">₹{(item.taxAmount || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-purple-600">₹{item.lineTotal.toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {payments.length > 0 && (
            <Card className="border border-gray-100">
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paymentDate).toLocaleTimeString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">{payment.paymentMethod}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-medium text-green-600 flex items-center justify-end gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {payment.amount.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 font-mono">{payment.transactionId || '-'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                {sale.customerName && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer</p>
                      <p className="text-base font-medium text-gray-900">{sale.customerName}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                  <p className="text-base font-medium text-gray-900">₹{sale.subtotal.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Discount</p>
                  <p className="text-base font-medium text-red-600">-₹{sale.discountAmount.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Tax</p>
                  <p className="text-base font-medium text-gray-900">₹{sale.taxAmount.toFixed(2)}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {sale.totalAmount.toFixed(2)}
                  </p>
                </div>

                {totalPaid > 0 && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                      <p className="text-lg font-medium text-green-600 flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {totalPaid.toFixed(2)}
                      </p>
                    </div>
                    {remaining > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Remaining</p>
                        <p className="text-lg font-medium text-red-600 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {remaining.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {sale.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{sale.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SaleDetailPage
