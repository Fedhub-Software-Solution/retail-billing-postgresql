import { baseApi } from './baseApi'

export interface InventoryTransaction {
  id: number
  productId: number
  productName?: string
  transactionType: string
  quantity: number
  referenceType?: string
  referenceId?: number
  notes?: string
  createdBy?: number
  createdAt: string
}

export interface CreateInventoryTransactionRequest {
  productId: number
  transactionType: string
  quantity: number
  referenceType?: string
  referenceId?: number
  notes?: string
}

export interface LowStockAlert {
  id: number
  name: string
  sku: string
  stockQuantity: number
  minStockLevel: number
  categoryName?: string
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryTransactions: builder.query<
      InventoryTransaction[],
      { productId?: number; transactionType?: string }
    >({
      query: (params) => ({
        url: '/inventory/transactions',
        params,
      }),
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: InventoryTransaction[] }) => response.data,
    }),
    getLowStockAlerts: builder.query<LowStockAlert[], { threshold?: number }>({
      query: (params) => ({
        url: '/inventory/low-stock',
        params: params.threshold ? { threshold: params.threshold.toString() } : {},
      }),
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: LowStockAlert[] }) => response.data,
    }),
    createInventoryTransaction: builder.mutation<InventoryTransaction, CreateInventoryTransactionRequest>({
      query: (body) => ({
        url: '/inventory/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: InventoryTransaction }) => response.data,
    }),
  }),
})

export const {
  useGetInventoryTransactionsQuery,
  useGetLowStockAlertsQuery,
  useCreateInventoryTransactionMutation,
} = inventoryApi

