import {
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  IndianRupee,
} from 'lucide-react'
import { useGetDashboardStatsQuery, useGetSalesTrendQuery } from '../../../store/api/dashboardApi'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../../lib/utils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery()
  const { data: salesTrend = [] } = useGetSalesTrendQuery({ period: '7' })

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Dashboard"
        message="Failed to load dashboard data. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!stats) {
    return null
  }

  // Calculate growth percentage (mock for now)
  const monthGrowth = '12.5' // This would come from API

  const statCards = [
    {
      title: "Today's Sales",
      count: stats.todaySales.count,
      amount: stats.todaySales.revenue,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      action: () => navigate('/billing'),
    },
    {
      title: "Month's Sales",
      count: stats.monthSales.count,
      amount: stats.monthSales.revenue,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      growth: monthGrowth,
      action: () => navigate('/sales'),
    },
    {
      title: 'Low Stock Products',
      count: stats.lowStockProducts,
      subtitle: 'View Products',
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      action: () => navigate('/products?lowStock=true'),
    },
    {
      title: 'Pending Payments',
      count: stats.pendingPayments,
      subtitle: 'View Sales',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      action: () => navigate('/sales?paymentStatus=pending'),
    },
  ]

  // Format sales trend data for chart
  const chartData = salesTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
  }))

  const maxQuantity =
    stats.topProducts.length > 0
      ? Math.max(...stats.topProducts.map((p) => p.totalQuantity))
      : 1

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card
              key={index}
              className="overflow-hidden group cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
              onClick={card.action}
            >
              <div className={cn('bg-gradient-to-br', card.bgColor, 'p-6')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-2">{card.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-gray-900 text-2xl font-bold">{card.count}</h3>
                      {card.growth && (
                        <span
                          className={cn(
                            'flex items-center gap-1 text-sm',
                            parseFloat(card.growth) >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {parseFloat(card.growth) >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {Math.abs(parseFloat(card.growth))}%
                        </span>
                      )}
                    </div>
                    {card.amount !== undefined && (
                      <p className="text-gray-700 mt-1 flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {card.amount.toFixed(2)}
                      </p>
                    )}
                    {card.subtitle && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                        {card.subtitle}
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div
                    className={cn(
                      card.iconBg,
                      'p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300'
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-lg font-semibold">Sales Trend (Last 7 Days)</h3>
                <p className="text-gray-500 text-sm mt-1">Daily revenue overview</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>

            {chartData.length > 0 && chartData.some((d) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#colorRevenue)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No sales data available</p>
                  <p className="text-sm mt-1">Start making sales to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-lg font-semibold">Top Products</h3>
                <p className="text-gray-500 text-sm mt-1">Best sellers</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/products')}
                className="text-purple-600 hover:text-purple-700"
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-xs text-purple-700 font-semibold">
                            {index + 1}
                          </span>
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">
                        {product.totalQuantity} sold
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${(product.totalQuantity / maxQuantity) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Revenue: ₹
                        {(product.totalQuantity * (product.averagePrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No product sales yet</p>
                  <p className="text-sm mt-1">Sales will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-gray-900 text-lg font-semibold mb-6">Recent Sales</h3>
          {stats.recentSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-30" />
              <p className="text-gray-500">No recent sales</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/sales/${sale.id}`)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">{sale.invoiceNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{sale.customerName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            sale.paymentStatus === 'paid'
                              ? 'success'
                              : sale.paymentStatus === 'cancelled'
                              ? 'destructive'
                              : sale.paymentStatus === 'partial'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/sales/${sale.id}`)
                          }}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white opacity-90 text-lg font-semibold">Total Revenue</h3>
              <IndianRupee className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-white text-3xl font-bold mb-2">
              ₹
              {(stats.todaySales.revenue + stats.monthSales.revenue).toFixed(2)}
            </p>
            <p className="text-white text-sm opacity-75">From all transactions</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white opacity-90 text-lg font-semibold">Avg Order Value</h3>
              <ShoppingCart className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-white text-3xl font-bold mb-2">
              ₹
              {stats.monthSales.count > 0
                ? (stats.monthSales.revenue / stats.monthSales.count).toFixed(2)
                : '0.00'}
            </p>
            <p className="text-white text-sm opacity-75">Per transaction</p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white opacity-90 text-lg font-semibold">Low Stock Alert</h3>
              <Package className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-white text-3xl font-bold mb-2">{stats.lowStockProducts}</p>
            <p className="text-white text-sm opacity-75">Products need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
