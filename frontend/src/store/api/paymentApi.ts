import { baseApi } from './baseApi'

export interface CreatePaymentOrderRequest {
  amount: number
  currency?: string
  paymentMethod: 'upi' | 'card'
  customerId?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export interface CreatePaymentOrderResponse {
  orderId: string
  amount: number
  currency: string
  razorpayOrderId?: string
  keyId?: string
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface VerifyPaymentResponse {
  verified: boolean
  transactionId: string
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentOrder: builder.mutation<CreatePaymentOrderResponse, CreatePaymentOrderRequest>({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: CreatePaymentOrderResponse }) => response.data,
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: VerifyPaymentResponse }) => response.data,
    }),
  }),
})

export const { useCreatePaymentOrderMutation, useVerifyPaymentMutation } = paymentApi
