import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Warehouse,
  Calendar,
  Download,
  Filter,
} from 'lucide-react'
import {
  useGetSalesSummaryQuery,
  useGetTopProductsQuery,
  useGetTopCustomersQuery,
  useGetInventoryStatusQuery,
  useGetDailySalesQuery,
} from '../../../store/api/reportApi'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { cn } from '../../../lib/utils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import {
  exportSalesSummary,
  exportTopProducts,
  exportTopCustomers,
  exportInventoryStatus,
  exportDailySales,
} from '../../../utils/exportUtils'

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [groupBy, setGroupBy] = useState('day')

  const { data: salesSummary, isLoading: loadingSummary } = useGetSalesSummaryQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    groupBy,
  })

  const { data: topProducts = [], isLoading: loadingProducts } = useGetTopProductsQuery({
    limit: 20,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const { data: topCustomers = [], isLoading: loadingCustomers } = useGetTopCustomersQuery({
    limit: 20,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const { data: inventoryStatus, isLoading: loadingInventory } = useGetInventoryStatusQuery()

  const { data: dailySales = [], isLoading: loadingDaily } = useGetDailySalesQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setGroupBy('day')
  }

  const handleExportReport = () => {
    switch (activeTab) {
      case 'sales':
        if (salesSummary) {
          exportSalesSummary(salesSummary.summary, salesSummary.totals)
        } else {
          alert('No sales data available to export')
        }
        break
      case 'products':
        if (topProducts.length > 0) {
          exportTopProducts(topProducts)
        } else {
          alert('No product data available to export')
        }
        break
      case 'customers':
        if (topCustomers.length > 0) {
          exportTopCustomers(topCustomers)
        } else {
          alert('No customer data available to export')
        }
        break
      case 'inventory':
        if (inventoryStatus) {
          exportInventoryStatus(inventoryStatus)
        } else {
          alert('No inventory data available to export')
        }
        break
      case 'daily':
        if (dailySales.length > 0) {
          exportDailySales(dailySales)
        } else {
          alert('No daily sales data available to export')
        }
        break
      default:
        alert('Please select a report tab to export')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Reports
          </h2>
          <p className="text-gray-500 mt-1">View detailed analytics and insights</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExportReport}
          disabled={
            (activeTab === 'sales' && (!salesSummary || loadingSummary)) ||
            (activeTab === 'products' && (topProducts.length === 0 || loadingProducts)) ||
            (activeTab === 'customers' && (topCustomers.length === 0 || loadingCustomers)) ||
            (activeTab === 'inventory' && (!inventoryStatus || loadingInventory)) ||
            (activeTab === 'daily' && (dailySales.length === 0 || loadingDaily))
          }
        >
          <Download className="w-5 h-5" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Summary</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="daily">Daily Sales</TabsTrigger>
        </TabsList>

        {/* Sales Summary Tab */}
        <TabsContent value="sales" className="space-y-4">
          {loadingSummary ? (
            <LoadingSpinner message="Loading sales summary..." />
          ) : salesSummary ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesSummary.totals.totalSales}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{salesSummary.totals.totalRevenue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Tax</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{salesSummary.totals.totalTax.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Discount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{salesSummary.totals.totalDiscount.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{salesSummary.totals.averageOrderValue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
                  {salesSummary.summary.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={salesSummary.summary}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="period"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Bar dataKey="totalRevenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center">
                      <EmptyState
                        icon={BarChart3}
                        title="No data available"
                        description="No sales data available for the selected period"
                        iconSize="md"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Table */}
              <Card className="border border-gray-100">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Period</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Sales</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Revenue</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Tax</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Discount</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesSummary.summary.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{item.period}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">{item.totalSales}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-medium text-purple-600">
                                ₹{item.totalRevenue.toFixed(2)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">₹{item.totalTax.toFixed(2)}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">
                                ₹{item.totalDiscount.toFixed(2)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">
                                ₹{item.averageOrderValue.toFixed(2)}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No sales data available"
              description="No sales data found for the selected period. Try adjusting your date range."
            />
          )}
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {loadingProducts ? (
            <LoadingSpinner message="Loading top products..." />
          ) : topProducts.length > 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Quantity Sold</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Revenue</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Sales Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topProducts.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">{product.categoryName || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {product.totalQuantity}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-medium text-purple-600">
                              ₹{product.totalRevenue.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm text-gray-900">{product.saleCount}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Package}
              title="No product data available"
              description="No product sales data found for the selected period."
            />
          )}
        </TabsContent>

        {/* Top Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          {loadingCustomers ? (
            <LoadingSpinner message="Loading top customers..." />
          ) : topCustomers.length > 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Orders</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Total Spent</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topCustomers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{customer.customerCode}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {customer.purchaseCount}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-medium text-purple-600">
                              ₹{customer.totalSpent.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm text-gray-900">
                              ₹{customer.averageOrderValue.toFixed(2)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Users}
              title="No customer data available"
              description="No customer purchase data found for the selected period."
            />
          )}
        </TabsContent>

        {/* Inventory Status Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {loadingInventory ? (
            <LoadingSpinner message="Loading inventory status..." />
          ) : inventoryStatus ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {inventoryStatus.summary.outOfStock}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {inventoryStatus.summary.lowStock}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">In Stock</p>
                    <p className="text-2xl font-bold text-green-600">
                      {inventoryStatus.summary.inStock}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventoryStatus.summary.activeProducts}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Inactive Products</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {inventoryStatus.summary.inactiveProducts}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{inventoryStatus.summary.totalInventoryValue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Low Stock Products */}
              {inventoryStatus.lowStockProducts.length > 0 && (
                <Card className="border border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">
                      Low Stock Products
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-orange-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">
                              Category
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-orange-900">
                              Current Stock
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-orange-900">
                              Min Level
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-200">
                          {inventoryStatus.lowStockProducts.map((product) => (
                            <tr key={product.id} className="bg-white">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.sku}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-600">{product.categoryName || '-'}</p>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Badge variant="warning">{product.stockQuantity}</Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <p className="text-sm text-gray-600">{product.minStockLevel}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              icon={Warehouse}
              title="No inventory data available"
              description="Unable to load inventory status. Please try again."
            />
          )}
        </TabsContent>

        {/* Daily Sales Tab */}
        <TabsContent value="daily" className="space-y-4">
          {loadingDaily ? (
            <LoadingSpinner message="Loading daily sales..." />
          ) : dailySales.length > 0 ? (
            <>
              <Card className="border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#9333ea"
                        strokeWidth={2}
                        dot={{ fill: '#9333ea', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border border-gray-100">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Sales Count</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Revenue</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Tax</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Discount</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dailySales.map((sale, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(sale.date).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">{sale.salesCount}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm font-medium text-purple-600">
                                ₹{sale.revenue.toFixed(2)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">₹{sale.tax.toFixed(2)}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">₹{sale.discount.toFixed(2)}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="text-sm text-gray-900">
                                ₹{sale.avgOrderValue.toFixed(2)}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-gray-100">
              <CardContent className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="No daily sales data available"
                  description="No daily sales data found for the selected period."
                  iconSize="md"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsPage
