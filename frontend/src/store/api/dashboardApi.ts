import { baseApi } from './baseApi'

export interface DashboardStats {
  todaySales: {
    count: number
    revenue: number
  }
  monthSales: {
    count: number
    revenue: number
  }
  lowStockProducts: number
  pendingPayments: number
  topProducts: Array<{
    id: number
    name: string
    sku: string
    totalQuantity: number
    totalRevenue: number
  }>
  recentSales: Array<{
    id: number
    invoiceNumber: string
    totalAmount: number
    saleDate: string
    paymentStatus: string
    customerName: string
  }>
}

export interface SalesTrend {
  date: string
  salesCount: number
  revenue: number
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Sale', 'Product'],
      transformResponse: (response: { success: boolean; data: DashboardStats }) => response.data,
    }),
    getSalesTrend: builder.query<SalesTrend[], { period?: string; days?: string }>({
      query: (params) => ({
        url: '/dashboard/sales-trend',
        params,
      }),
      providesTags: ['Sale'],
      transformResponse: (response: { success: boolean; data: SalesTrend[] }) => response.data,
    }),
  }),
})

export const { useGetDashboardStatsQuery, useGetSalesTrendQuery } = dashboardApi

