import { baseApi } from './baseApi'

export interface SalesSummaryItem {
  period: string
  totalSales: number
  totalRevenue: number
  totalTax: number
  totalDiscount: number
  averageOrderValue: number
}

export interface SalesSummary {
  summary: SalesSummaryItem[]
  totals: {
    totalSales: number
    totalRevenue: number
    totalTax: number
    totalDiscount: number
    averageOrderValue: number
  }
  period: {
    startDate: string | null
    endDate: string | null
  }
}

export interface TopProduct {
  id: number
  name: string
  sku: string
  categoryId?: number
  categoryName?: string
  totalQuantity: number
  totalRevenue: number
  saleCount: number
}

export interface TopCustomer {
  id: number
  customerCode: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  purchaseCount: number
  totalSpent: number
  averageOrderValue: number
}

export interface InventoryStatus {
  summary: {
    outOfStock: number
    lowStock: number
    inStock: number
    activeProducts: number
    inactiveProducts: number
    totalInventoryValue: number
  }
  lowStockProducts: Array<{
    id: number
    name: string
    sku: string
    stockQuantity: number
    minStockLevel: number
    categoryName?: string
  }>
}

export interface DailySale {
  date: string
  salesCount: number
  revenue: number
  tax: number
  discount: number
  avgOrderValue: number
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesSummary: builder.query<
      SalesSummary,
      { startDate?: string; endDate?: string; groupBy?: string }
    >({
      query: (params) => ({
        url: '/reports/sales-summary',
        params,
      }),
      providesTags: ['Sale'],
      transformResponse: (response: { success: boolean; data: SalesSummary }) => response.data,
    }),
    getTopProducts: builder.query<
      TopProduct[],
      { limit?: number; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '/reports/top-products',
        params,
      }),
      providesTags: ['Sale', 'Product'],
      transformResponse: (response: { success: boolean; data: TopProduct[] }) => response.data,
    }),
    getTopCustomers: builder.query<
      TopCustomer[],
      { limit?: number; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '/reports/top-customers',
        params,
      }),
      providesTags: ['Sale', 'Customer'],
      transformResponse: (response: { success: boolean; data: TopCustomer[] }) => response.data,
    }),
    getInventoryStatus: builder.query<InventoryStatus, void>({
      query: () => '/reports/inventory-status',
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: InventoryStatus }) => response.data,
    }),
    getDailySales: builder.query<DailySale[], { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/reports/daily-sales',
        params,
      }),
      providesTags: ['Sale'],
      transformResponse: (response: { success: boolean; data: DailySale[] }) => response.data,
    }),
  }),
})

export const {
  useGetSalesSummaryQuery,
  useGetTopProductsQuery,
  useGetTopCustomersQuery,
  useGetInventoryStatusQuery,
  useGetDailySalesQuery,
} = reportApi

