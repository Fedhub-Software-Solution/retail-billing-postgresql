import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectCartItems,
  selectCartCustomer,
  selectCartDiscount,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
  addItem,
  updateItemQuantity,
  removeItem,
  setCustomer,
  setDiscount,
  clearCart,
} from '../../../store/slices/cartSlice'
import { useGetProductsQuery } from '../../../store/api/productApi'
import { useGetCustomersQuery, useCreateCustomerMutation } from '../../../store/api/customerApi'
import { useCreateSaleMutation } from '../../../store/api/saleApi'
import { useApplyDiscountMutation } from '../../../store/api/discountApi'
import { useGetSettingByKeyQuery } from '../../../store/api/settingsApi'
import { AddCustomerModal } from '../components/AddCustomerModal'
import { PaymentModal } from '../components/PaymentModal'
import { BarcodeScannerModal } from '../components/BarcodeScannerModal'
import { BillingHeader } from '../components/BillingHeader'
import { CartHeader } from '../components/CartHeader'
import { CartItemsList } from '../components/CartItemsList'
import { BillSummary } from '../components/BillSummary'

const BillingPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cartItems = useSelector(selectCartItems)
  const customerId = useSelector(selectCartCustomer)
  const discountAmount = useSelector(selectCartDiscount)
  const subtotal = useSelector(selectCartSubtotal)
  const tax = useSelector(selectCartTax)
  const total = useSelector(selectCartTotal)

  const [searchItem, setSearchItem] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [manualDiscount, setManualDiscount] = useState(0)
  const [appliedDiscountInfo, setAppliedDiscountInfo] = useState<{ 
    type: string
    value: number
    name: string
    maxDiscountAmount?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: productsData } = useGetProductsQuery({
    search: searchItem,
    limit: 20,
    page: 1,
  })
  const { data: customersData } = useGetCustomersQuery({ limit: 100 })
  const { data: taxRateSetting } = useGetSettingByKeyQuery('tax_rate')
  const [createSale] = useCreateSaleMutation()
  const [applyDiscount] = useApplyDiscountMutation()
  const [createCustomer] = useCreateCustomerMutation()

  const products = productsData?.data || []
  const customers = customersData?.data || []
  const taxRate = taxRateSetting ? parseFloat(taxRateSetting.value) : 0

  const selectedCustomer = customers.find((c) => c.id === customerId)

  const handleAddProduct = (product: any) => {
    if (product.stockQuantity <= 0) {
      setError('Product is out of stock')
      setTimeout(() => setError(null), 3000)
      return
    }

    const existingItem = cartItems.find((item) => item.productId === product.id)
    if (existingItem && existingItem.quantity >= product.stockQuantity) {
      setError('Insufficient stock available')
      setTimeout(() => setError(null), 3000)
      return
    }

    dispatch(
      addItem({
        productId: product.id,
        productName: product.name,
        sku: product.sku || '',
        unitPrice: product.unitPrice,
        quantity: 1,
        taxRate: product.taxRate || taxRate,
        stockQuantity: product.stockQuantity,
      })
    )
    setSearchItem('')
    setError(null)
  }

  const handleQuantityChange = (productId: number, quantity: number) => {
    const item = cartItems.find((item) => item.productId === productId)
    if (item && quantity > item.stockQuantity) {
      setError('Insufficient stock available')
      setTimeout(() => setError(null), 3000)
      return
    }
    dispatch(updateItemQuantity({ productId, quantity }))
    setError(null)
  }

  const handleRemoveItem = (productId: number) => {
    dispatch(removeItem(productId))
  }

  const handleSelectCustomer = (customer: any) => {
    dispatch(setCustomer(customer.id))
    setCustomerName(`${customer.firstName} ${customer.lastName || ''}`)
    setShowCustomerDropdown(false)
  }

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value)
    setShowCustomerDropdown(value.length > 0)
    if (value.length === 0) {
      dispatch(setCustomer(undefined))
    }
  }

  const handleAddNewCustomer = async (name: string, phone: string, email?: string) => {
    try {
      const result = await createCustomer({
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || undefined,
        phone: phone || undefined,
        email: email || undefined,
        country: 'India',
        customerType: 'retail',
      }).unwrap()
      dispatch(setCustomer(result.id))
      setCustomerName(`${result.firstName} ${result.lastName || ''}`)
      setShowAddCustomerModal(false)
      setShowCustomerDropdown(false)
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create customer')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError('Please enter a discount code')
      setTimeout(() => setError(null), 3000)
      return
    }

    setApplyingDiscount(true)
    setError(null)

    try {
      const result = await applyDiscount({
        code: discountCode,
        amount: subtotal,
      }).unwrap()
      
      // Store discount info for display and recalculation
      setAppliedDiscountInfo({
        type: result.discount.discountType,
        value: result.discount.discountValue,
        name: result.discount.name,
        maxDiscountAmount: result.discount.maxDiscountAmount,
      })
      
      // Apply the calculated discount amount (backend already calculates based on percentage if type is percentage)
      dispatch(setDiscount(result.discountAmount))
      
      // Clear manual discount when code discount is applied
      setManualDiscount(0)
      
      setDiscountCode('')
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid discount code')
      setAppliedDiscountInfo(null)
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleManualDiscountChange = (value: number) => {
    // Clamp value between 0 and 100 for percentage
    const percentage = Math.min(100, Math.max(0, value))
    setManualDiscount(percentage)
    
    // Clear applied discount info when manual discount is used
    if (percentage > 0) {
      setAppliedDiscountInfo(null)
      setDiscountCode('')
    }
    
    // Calculate discount amount from percentage
    const discountAmount = (subtotal * percentage) / 100
    dispatch(setDiscount(discountAmount))
  }

  // Recalculate discount amount when subtotal changes (if manual discount percentage is set or discount code is applied)
  useEffect(() => {
    if (manualDiscount > 0 && !appliedDiscountInfo) {
      // Manual discount: calculate percentage
      const discountAmount = (subtotal * manualDiscount) / 100
      dispatch(setDiscount(discountAmount))
    } else if (appliedDiscountInfo) {
      let discountAmount = 0
      
      if (appliedDiscountInfo.type === 'percentage') {
        // Calculate percentage-based discount
        discountAmount = (subtotal * appliedDiscountInfo.value) / 100
        // Apply max discount limit if set
        if (appliedDiscountInfo.maxDiscountAmount && discountAmount > appliedDiscountInfo.maxDiscountAmount) {
          discountAmount = appliedDiscountInfo.maxDiscountAmount
        }
      } else {
        // Fixed discount amount
        discountAmount = appliedDiscountInfo.value
      }
      
      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal
      }
      
      dispatch(setDiscount(discountAmount))
    }
  }, [subtotal, manualDiscount, appliedDiscountInfo, dispatch])

  const handleCompleteSale = async (method: string, transactionId?: string, notes?: string) => {
    if (cartItems.length === 0) {
      setError('Cart is empty')
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Combine notes with transaction ID if provided
      let finalNotes = notes || ''
      if (transactionId) {
        finalNotes = finalNotes
          ? `${finalNotes}\nTransaction ID: ${transactionId}`
          : `Transaction ID: ${transactionId}`
      }

      const saleData = {
        customerId: customerId || undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount || 0,
        })),
        discountAmount: discountAmount,
        paymentMethod: method,
        notes: finalNotes || undefined,
      }

      const result = await createSale(saleData).unwrap()
      dispatch(clearCart())
      setShowPaymentModal(false)
      setCustomerName('')
      setDiscountCode('')
      setManualDiscount(0)
      setAppliedDiscountInfo(null)
      navigate(`/sales/${result.id}`)
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create sale')
    } finally {
      setLoading(false)
    }
  }

  const billNumber = `BILL #${Date.now().toString().slice(-6)}`

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 animate-shake">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Main Billing Card */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
        {/* Top Search Bar */}
        <BillingHeader
          searchItem={searchItem}
          onSearchItemChange={setSearchItem}
          products={products}
          onSelectProduct={handleAddProduct}
          onBarcodeScanClick={() => setShowBarcodeScanner(true)}
          customerName={customerName}
          onCustomerNameChange={handleCustomerNameChange}
          showCustomerDropdown={showCustomerDropdown}
          customers={customers}
          onSelectCustomer={handleSelectCustomer}
          onAddNewCustomer={() => {
            setShowAddCustomerModal(true)
            setShowCustomerDropdown(false)
          }}
          onCloseCustomerDropdown={() => setShowCustomerDropdown(false)}
          billNumber={billNumber}
        />

        {/* Main Content Area - Horizontal Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Cart Items */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <CartHeader />
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-br from-gray-50 via-purple-50/20 to-indigo-50/20 smart-scroll">
              <CartItemsList
                items={cartItems}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          {/* Right Side - Bill Summary */}
          <BillSummary
            selectedCustomer={selectedCustomer}
            subtotal={subtotal}
            discountAmount={discountAmount}
            tax={tax}
            total={total}
            discountCode={discountCode}
            manualDiscount={manualDiscount}
            appliedDiscountInfo={appliedDiscountInfo}
            applyingDiscount={applyingDiscount}
            onDiscountCodeChange={(code) => {
              setDiscountCode(code)
              if (code === '') {
                setAppliedDiscountInfo(null)
                dispatch(setDiscount(0))
              }
            }}
            onApplyDiscount={handleApplyDiscount}
            onManualDiscountChange={handleManualDiscountChange}
            onCompleteSale={() => setShowPaymentModal(true)}
            cartItemsCount={cartItems.length}
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAddCustomer={handleAddNewCustomer}
        initialName={customerName}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        customerName={
          selectedCustomer
            ? [selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(' ').trim() || undefined
            : undefined
        }
        onComplete={handleCompleteSale}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onSelectProduct={handleAddProduct}
      />
    </div>
  )
}

export default BillingPage
