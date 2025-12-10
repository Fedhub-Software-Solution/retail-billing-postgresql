import { useState } from 'react'
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../../../store/api/paymentApi'

export const usePaymentGateway = () => {
  const [processing, setProcessing] = useState(false)
  const [createPaymentOrder] = useCreatePaymentOrderMutation()
  const [verifyPayment] = useVerifyPaymentMutation()

  const initializeRazorpay = async (
    method: 'upi' | 'card',
    orderData: any,
    keyId: string,
    total: number,
    customerName?: string,
    onSuccess: (transactionId: string) => void,
    onError: (error: string) => void
  ) => {
    const Razorpay = (window as any).Razorpay

    const options = {
      key: keyId,
      amount: Math.round(total * 100), // Amount in paise
      currency: 'INR',
      name: 'Retail Billing System',
      description: `Payment for order ${orderData.orderId}`,
      order_id: orderData.razorpayOrderId || orderData.orderId,
      handler: async (response: any) => {
        try {
          const verifyData = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap()

          if (verifyData.verified) {
            onSuccess(verifyData.transactionId)
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error: any) {
          console.error('Payment verification error:', error)
          onError(error?.data?.message || 'Payment verification failed. Please contact support.')
        }
      },
      prefill: {
        name: customerName || 'Customer',
        email: '',
        contact: '',
      },
      notes: {
        orderId: orderData.orderId,
        paymentMethod: method,
      },
      theme: {
        color: '#6366f1',
      },
      method: {
        upi: method === 'upi',
        card: method === 'card',
      },
      modal: {
        ondismiss: () => {
          setProcessing(false)
        },
      },
    }

    const razorpay = new Razorpay(options)
    razorpay.open()
  }

  const processPayment = async (
    method: 'upi' | 'card',
    total: number,
    customerName?: string,
    onSuccess: (transactionId: string) => void,
    onError: (error: string) => void
  ) => {
    setProcessing(true)
    try {
      const orderData = await createPaymentOrder({
        amount: total,
        currency: 'INR',
        paymentMethod: method,
        customerName: customerName,
      }).unwrap()

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag'

      if (typeof (window as any).Razorpay === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          initializeRazorpay(method, orderData, razorpayKeyId, total, customerName, onSuccess, onError)
        }
        script.onerror = () => {
          setProcessing(false)
          onError('Payment gateway not available. Please enter transaction ID manually.')
        }
        document.body.appendChild(script)
      } else {
        initializeRazorpay(method, orderData, razorpayKeyId, total, customerName, onSuccess, onError)
      }
    } catch (error: any) {
      console.error('Payment gateway error:', error)
      setProcessing(false)
      onError(error?.data?.message || 'Payment gateway error. Please try again or use manual transaction ID entry.')
    }
  }

  return {
    processing,
    setProcessing,
    processPayment,
  }
}

