import { useState } from 'react'
import { Plus, Warehouse, AlertTriangle, Package, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import {
  useGetInventoryTransactionsQuery,
  useGetLowStockAlertsQuery,
  useCreateInventoryTransactionMutation,
  InventoryTransaction,
  CreateInventoryTransactionRequest,
} from '../../../store/api/inventoryApi'
import { useGetProductsQuery } from '../../../store/api/productApi'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
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
import { Textarea } from '../../../components/ui/textarea'
import { cn } from '../../../lib/utils'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'

const InventoryPage = () => {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState('adjustment')
  const [productId, setProductId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const { data: transactions = [], isLoading: loadingTransactions } =
    useGetInventoryTransactionsQuery({})
  const { data: lowStockAlerts = [] } = useGetLowStockAlertsQuery({})
  const { data: productsData } = useGetProductsQuery({ limit: 1000 })
  const [createTransaction] = useCreateInventoryTransactionMutation()

  const products = productsData?.data || []

  const handleCreateTransaction = async () => {
    if (!productId || !quantity) {
      return
    }

    try {
      await createTransaction({
        productId: productId as number,
        transactionType,
        quantity: parseInt(quantity),
        notes: notes || undefined,
      }).unwrap()
      setTransactionDialogOpen(false)
      setProductId('')
      setQuantity('')
      setNotes('')
      setTransactionType('adjustment')
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'in':
      case 'purchase':
      case 'return':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {type}
          </Badge>
        )
      case 'out':
      case 'sale':
      case 'adjustment':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {type}
          </Badge>
        )
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
            Inventory Management
          </h2>
          <p className="text-gray-500 mt-1">Manage stock levels and inventory transactions</p>
        </div>
        <Button onClick={() => setTransactionDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Stock Adjustment
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Low Stock Alert ({lowStockAlerts.length} products)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {lowStockAlerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-white rounded-lg p-2 border border-orange-200"
                    >
                      <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                      <p className="text-xs text-gray-600">
                        Stock: {alert.stockQuantity} / Min: {alert.minStockLevel}
                      </p>
                    </div>
                  ))}
                </div>
                {lowStockAlerts.length > 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => (window.location.href = '/products?lowStock=true')}
                  >
                    View All Low Stock Products
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border border-gray-100">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <p className="text-sm text-gray-500 mt-1">Recent inventory transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12">
                      <EmptyState
                        icon={Warehouse}
                        title="No transactions found"
                        description="Create a stock adjustment to get started"
                        actionLabel="Stock Adjustment"
                        onAction={() => setTransactionDialogOpen(true)}
                        iconSize="md"
                      />
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 50).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.productName || `Product #${transaction.productId}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">{getTransactionTypeBadge(transaction.transactionType)}</td>
                      <td className="px-6 py-4 text-right">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {transaction.quantity > 0 ? '+' : ''}
                          {transaction.quantity}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{transaction.notes || '-'}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
            <DialogDescription>
              Adjust inventory levels for a product. Use positive values to add stock, negative to
              remove.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <Select
                value={productId.toString()}
                onValueChange={(value) => setProductId(parseInt(value))}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (Stock: {product.stockQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger id="transactionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity (use - for decrease)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive values add stock, negative values remove stock
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this transaction..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransaction} disabled={!productId || !quantity}>
              Create Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryPage
