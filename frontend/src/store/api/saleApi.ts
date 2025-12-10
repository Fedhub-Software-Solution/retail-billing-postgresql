import { baseApi } from './baseApi'

export interface SaleItem {
  id?: number
  productId: number
  productName?: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  taxAmount?: number
  lineTotal: number
}

export interface Sale {
  id: number
  invoiceNumber: string
  customerId?: number
  customerName?: string
  saleDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentStatus: string
  paymentMethod?: string
  notes?: string
  createdBy?: number
  createdByName?: string
  items: SaleItem[]
  createdAt: string
  updatedAt: string
}

export interface SaleQueryParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  customerId?: number
  paymentStatus?: string
  createdBy?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateSaleRequest {
  customerId?: number
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    discountAmount?: number
  }>
  discountAmount?: number
  paymentMethod?: string
  transactionId?: string
  notes?: string
}

export interface UpdateSaleRequest {
  customerId?: number
  items?: Array<{
    productId: number
    quantity: number
    unitPrice: number
    discountAmount?: number
  }>
  discountAmount?: number
  paymentMethod?: string
  notes?: string
}

export interface CreatePaymentRequest {
  saleId: number
  paymentMethod: string
  amount: number
  transactionId?: string
  notes?: string
}

export interface CreatePaymentResponse {
  id: number
  saleId: number
  amount: number
}

export interface Payment {
  id: number
  saleId: number
  paymentMethod: string
  amount: number
  transactionId?: string
  paymentDate: string
  notes?: string
}

export const saleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<PaginatedResponse<Sale>, SaleQueryParams>({
      query: (params) => ({
        url: '/sales',
        params,
      }),
      providesTags: ['Sale'],
      transformResponse: (response: { success: boolean; data: PaginatedResponse<Sale> }) =>
        response.data,
    }),
    getSaleById: builder.query<Sale, number>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }],
      transformResponse: (response: { success: boolean; data: Sale }) => response.data,
    }),
    createSale: builder.mutation<Sale, CreateSaleRequest>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sale', 'Product', 'Customer'],
      transformResponse: (response: { success: boolean; data: Sale }) => response.data,
    }),
    updateSale: builder.mutation<Sale, { id: number; data: UpdateSaleRequest }>({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }, 'Sale', 'Product'],
      transformResponse: (response: { success: boolean; data: Sale }) => response.data,
    }),
    cancelSale: builder.mutation<void, number>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sale', 'Product'],
    }),
    getSalePayments: builder.query<Payment[], number>({
      query: (saleId) => `/sales/${saleId}/payments`,
      providesTags: (result, error, saleId) => [{ type: 'Sale', id: saleId }],
      transformResponse: (response: { success: boolean; data: Payment[] }) => response.data,
    }),
    createPayment: builder.mutation<CreatePaymentResponse, CreatePaymentRequest>({
      query: (body) => ({
        url: '/sales/payments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { saleId }) => [{ type: 'Sale', id: saleId }, 'Sale'],
      transformResponse: (response: { success: boolean; data: CreatePaymentResponse }) => response.data,
    }),
  }),
})

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useCancelSaleMutation,
  useGetSalePaymentsQuery,
  useCreatePaymentMutation,
} = saleApi

