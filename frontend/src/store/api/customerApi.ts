import { baseApi } from './baseApi'

export interface Customer {
  id: number
  customerCode: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  customerType: string
  creditLimit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  totalPurchases?: number
}

export interface CustomerQueryParams {
  page?: number
  limit?: number
  search?: string
  customerType?: string
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

export interface CreateCustomerRequest {
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  customerType?: string
  creditLimit?: number
}

export interface UpdateCustomerRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  customerType?: string
  creditLimit?: number
  isActive?: boolean
}

export interface CustomerStatistics {
  totalCustomers: number
  activeCustomers: number
  totalPurchases: number
  averagePurchaseValue: number
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<PaginatedResponse<Customer>, CustomerQueryParams>({
      query: (params) => ({
        url: '/customers',
        params,
      }),
      providesTags: ['Customer'],
      transformResponse: (response: { success: boolean; data: PaginatedResponse<Customer> }) =>
        response.data,
    }),
    getCustomerById: builder.query<Customer, number>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
      transformResponse: (response: { success: boolean; data: Customer }) => response.data,
    }),
    getCustomerStatistics: builder.query<CustomerStatistics, void>({
      query: () => '/customers/statistics',
      providesTags: ['Customer'],
      transformResponse: (response: { success: boolean; data: CustomerStatistics }) => response.data,
    }),
    getCustomerSales: builder.query<any[], number>({
      query: (id) => `/customers/${id}/sales`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
      transformResponse: (response: { success: boolean; data: any[] }) => response.data,
    }),
    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
      transformResponse: (response: { success: boolean; data: Customer }) => response.data,
    }),
    updateCustomer: builder.mutation<Customer, { id: number; data: UpdateCustomerRequest }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
      transformResponse: (response: { success: boolean; data: Customer }) => response.data,
    }),
    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerStatisticsQuery,
  useGetCustomerSalesQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi

