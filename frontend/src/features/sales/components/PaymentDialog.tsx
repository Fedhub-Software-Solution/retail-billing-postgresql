import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Payment } from '@mui/icons-material'
import { useCreatePaymentMutation } from '../../../store/api/saleApi'

interface PaymentDialogProps {
  saleId: number
  remainingAmount: number
}

const PaymentDialog = ({ saleId, remainingAmount }: PaymentDialogProps) => {
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amount, setAmount] = useState(remainingAmount)
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [createPayment, { isLoading }] = useCreatePaymentMutation()

  const handleSubmit = async () => {
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (amount > remainingAmount) {
      setError(`Amount cannot exceed remaining balance of ₹${remainingAmount.toFixed(2)}`)
      return
    }

    setError(null)

    try {
      await createPayment({
        saleId,
        paymentMethod,
        amount,
        transactionId: transactionId || undefined,
        notes: notes || undefined,
      }).unwrap()
      setOpen(false)
      setAmount(remainingAmount)
      setTransactionId('')
      setNotes('')
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to record payment')
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Payment />}
        onClick={() => setOpen(true)}
      >
        Record Payment
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Typography variant="h6" align="center">
              Remaining Balance: ₹{remainingAmount.toFixed(2)}
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              inputProps={{ step: '0.01', min: '0', max: remainingAmount }}
              helperText={`Maximum: ₹${remainingAmount.toFixed(2)}`}
            />

            <TextField
              fullWidth
              label="Transaction ID (Optional)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading || amount <= 0}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentDialog

