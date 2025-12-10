import { useState } from 'react'
import { Plus, Edit, Trash2, Tag, Percent, Calendar, Users } from 'lucide-react'
import {
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  Discount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
} from '../../../store/api/discountApi'
import DiscountForm from '../components/DiscountForm'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
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

const DiscountsPage = () => {
  const { data: discounts = [], isLoading, error } = useGetDiscountsQuery()
  const [createDiscount] = useCreateDiscountMutation()
  const [updateDiscount] = useUpdateDiscountMutation()
  const [deleteDiscount] = useDeleteDiscountMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const handleCreate = () => {
    setFormMode('create')
    setSelectedDiscount(null)
    setFormOpen(true)
  }

  const handleEdit = (discount: Discount) => {
    setFormMode('edit')
    setSelectedDiscount(discount)
    setFormOpen(true)
  }

  const handleDelete = (discount: Discount) => {
    setSelectedDiscount(discount)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CreateDiscountRequest | UpdateDiscountRequest) => {
    try {
      if (formMode === 'create') {
        await createDiscount(data as CreateDiscountRequest).unwrap()
      } else if (selectedDiscount) {
        await updateDiscount({
          id: selectedDiscount.id,
          data: data as UpdateDiscountRequest,
        }).unwrap()
      }
      setFormOpen(false)
      setSelectedDiscount(null)
    } catch (error) {
      console.error('Error saving discount:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedDiscount) {
      try {
        await deleteDiscount(selectedDiscount.id).unwrap()
        setDeleteDialogOpen(false)
        setSelectedDiscount(null)
      } catch (error) {
        console.error('Error deleting discount:', error)
      }
    }
  }

  const isDiscountActive = (discount: Discount) => {
    if (!discount.isActive) return false
    const now = new Date()
    if (discount.startDate && new Date(discount.startDate) > now) return false
    if (discount.endDate && new Date(discount.endDate) < now) return false
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return false
    return true
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading discounts..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Discounts"
        message="Failed to load discounts. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  const activeDiscounts = discounts.filter((d) => isDiscountActive(d))
  const inactiveDiscounts = discounts.filter((d) => !isDiscountActive(d))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            Discounts
          </h2>
          <p className="text-gray-500 mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Discount
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Discounts</p>
                <p className="text-2xl font-bold text-gray-900">{discounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Discounts</p>
                <p className="text-2xl font-bold text-gray-900">{activeDiscounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {discounts.reduce((sum, d) => sum + d.usedCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Discounts */}
      {activeDiscounts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Discounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDiscounts.map((discount) => (
              <Card
                key={discount.id}
                className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{discount.name}</h3>
                          <Badge variant="success">Active</Badge>
                        </div>
                        {discount.code && (
                          <p className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                            {discount.code}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(discount)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(discount)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {discount.discountType === 'percentage'
                            ? `${discount.discountValue}%`
                            : `₹${discount.discountValue}`}
                        </span>
                      </div>
                      {discount.minPurchaseAmount > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Min: ₹{discount.minPurchaseAmount}
                          </span>
                        </div>
                      )}
                      {(discount.startDate || discount.endDate) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {discount.startDate &&
                              new Date(discount.startDate).toLocaleDateString()}
                            {discount.startDate && discount.endDate && ' - '}
                            {discount.endDate && new Date(discount.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {discount.usageLimit && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Used: {discount.usedCount} / {discount.usageLimit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Discounts */}
      {inactiveDiscounts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inactive Discounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveDiscounts.map((discount) => (
              <Card
                key={discount.id}
                className="border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{discount.name}</h3>
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                        {discount.code && (
                          <p className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                            {discount.code}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(discount)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(discount)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {discount.discountType === 'percentage'
                            ? `${discount.discountValue}%`
                            : `₹${discount.discountValue}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {discounts.length === 0 && (
        <EmptyState
          icon={Tag}
          title="No discounts found"
          description="Get started by creating your first discount or promotion code"
          actionLabel="Add Discount"
          onAction={handleCreate}
        />
      )}

      {/* Discount Form Modal */}
      <DiscountForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedDiscount(null)
        }}
        onSubmit={handleFormSubmit}
        discount={selectedDiscount || undefined}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDiscount?.name}"? This action cannot be
              undone.
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

export default DiscountsPage
