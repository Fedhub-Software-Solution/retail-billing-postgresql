import { baseApi } from './baseApi'

export interface Discount {
  id: number
  code?: string
  name: string
  discountType: string
  discountValue: number
  minPurchaseAmount: number
  maxDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDiscountRequest {
  code?: string
  name: string
  discountType: string
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  isActive?: boolean
}

export interface UpdateDiscountRequest {
  code?: string
  name?: string
  discountType?: string
  discountValue?: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  isActive?: boolean
}

export interface ApplyDiscountRequest {
  code?: string
  discountId?: number
  amount: number
}

export interface ApplyDiscountResponse {
  discountAmount: number
  discount: Discount
}

export const discountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscounts: builder.query<Discount[], void>({
      query: () => '/discounts',
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: Discount[] }) => response.data,
    }),
    getDiscountById: builder.query<Discount, number>({
      query: (id) => `/discounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      transformResponse: (response: { success: boolean; data: Discount }) => response.data,
    }),
    createDiscount: builder.mutation<Discount, CreateDiscountRequest>({
      query: (body) => ({
        url: '/discounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: Discount }) => response.data,
    }),
    updateDiscount: builder.mutation<Discount, { id: number; data: UpdateDiscountRequest }>({
      query: ({ id, data }) => ({
        url: `/discounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
      transformResponse: (response: { success: boolean; data: Discount }) => response.data,
    }),
    deleteDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    applyDiscount: builder.mutation<ApplyDiscountResponse, ApplyDiscountRequest>({
      query: (body) => ({
        url: '/discounts/apply',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { success: boolean; data: ApplyDiscountResponse }) => response.data,
    }),
  }),
})

export const {
  useGetDiscountsQuery,
  useGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useApplyDiscountMutation,
} = discountApi

