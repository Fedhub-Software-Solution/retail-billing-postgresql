import { useState, useEffect } from 'react'
import { CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { usePaymentGateway } from '../hooks/usePaymentGateway'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  onComplete: (method: string, transactionId?: string, notes?: string) => void
  customerName?: string
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
]

export const PaymentModal = ({ open, onClose, total, onComplete, customerName }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const { processing, setProcessing, processPayment } = usePaymentGateway()

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentMethod('cash')
      setTransactionId('')
      setNotes('')
      setProcessing(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For cash - complete directly
    if (paymentMethod === 'cash') {
      onComplete(
        paymentMethod,
        transactionId.trim() || undefined,
        notes.trim() || undefined
      )
      return
    }

    // For UPI or Card - initiate payment gateway
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      await processPayment(
        paymentMethod,
        total,
        customerName,
        (txnId) => {
          setTransactionId(txnId)
          setProcessing(false)
          onComplete(paymentMethod, txnId, notes.trim() || undefined)
        },
        (error) => {
          setProcessing(false)
          alert(error)
        }
      )
    }
  }

  const requiresTransactionId = paymentMethod === 'card' || paymentMethod === 'upi'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Complete Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {customerName && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">Customer</p>
              <p className="text-base font-medium text-gray-900">{customerName}</p>
            </div>
          )}

          {/* Total Amount */}
          <div>
            <Label className="text-sm text-gray-600 mb-1 block">Total Amount</Label>
            <p className="text-3xl font-bold text-purple-600">₹{total.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label htmlFor="paymentMethod" className="text-sm font-medium mb-2 block">
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue>
                  {paymentMethods.find((m) => m.value === paymentMethod) && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = paymentMethods.find((m) => m.value === paymentMethod)!.icon
                        return <Icon className="w-4 h-4" />
                      })()}
                      <span>{paymentMethods.find((m) => m.value === paymentMethod)!.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Processing Status */}
          {processing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Processing {paymentMethod === 'upi' ? 'UPI' : 'Card'} payment...
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Please wait while we process your payment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction ID for Card/UPI (shown after payment or for manual entry) */}
          {requiresTransactionId && !processing && (
            <div>
              <Label htmlFor="transactionId" className="text-sm font-medium mb-2 block">
                Transaction ID {paymentMethod === 'upi' ? '(UPI Reference Number)' : '(Card Transaction ID)'}
              </Label>
              <Input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={
                  paymentMethod === 'upi'
                    ? 'Enter UPI transaction reference number'
                    : 'Enter card transaction ID'
                }
                className="w-full"
                disabled={processing}
              />
              <p className="text-xs text-gray-500 mt-1">
                {paymentMethod === 'upi'
                  ? 'Enter the UPI transaction reference number after payment completion, or click "Process Payment" to use payment gateway'
                  : 'Enter the card transaction ID after payment completion, or click "Process Payment" to use payment gateway'}
              </p>
            </div>
          )}

          {/* Process Payment Button for UPI/Card */}
          {requiresTransactionId && !processing && !transactionId.trim() && (
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => {
                  processPayment(
                    paymentMethod as 'upi' | 'card',
                    total,
                    customerName,
                    (txnId) => {
                      setTransactionId(txnId)
                      setProcessing(false)
                    },
                    (error) => {
                      setProcessing(false)
                      alert(error)
                    }
                  )
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {paymentMethod === 'upi' ? (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Process UPI Payment
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Card Payment
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Or enter transaction ID manually below
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={processing || (requiresTransactionId && !transactionId.trim())}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : requiresTransactionId && transactionId.trim() ? (
                'Confirm Payment'
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

