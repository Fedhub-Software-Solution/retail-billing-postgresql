import { baseApi } from './baseApi'

export interface Product {
  id: number
  sku: string
  name: string
  description?: string
  categoryId?: number
  categoryName?: string
  barcode?: string
  unitPrice: number
  costPrice?: number
  stockQuantity: number
  minStockLevel: number
  unit: string
  imageUrl?: string
  isActive: boolean
  taxRate: number
  createdAt: string
  updatedAt: string
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: string
  order?: 'asc' | 'desc'
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

export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  categoryId?: number
  barcode?: string
  unitPrice: number
  costPrice?: number
  stockQuantity?: number
  minStockLevel?: number
  unit?: string
  taxRate?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  categoryId?: number
  barcode?: string
  unitPrice?: number
  costPrice?: number
  stockQuantity?: number
  minStockLevel?: number
  unit?: string
  imageUrl?: string
  isActive?: boolean
  taxRate?: number
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductQueryParams>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: PaginatedResponse<Product> }) =>
        response.data,
    }),
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      transformResponse: (response: { success: boolean; data: Product }) => response.data,
    }),
    getLowStockProducts: builder.query<Product[], { threshold?: number }>({
      query: (params) => ({
        url: '/products/low-stock',
        params: params.threshold ? { threshold: params.threshold.toString() } : {},
      }),
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: Product[] }) => response.data,
    }),
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: Product }) => response.data,
    }),
    updateProduct: builder.mutation<Product, { id: number; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
      transformResponse: (response: { success: boolean; data: Product }) => response.data,
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetLowStockProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi

