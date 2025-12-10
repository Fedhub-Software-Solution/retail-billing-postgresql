import { baseApi } from './baseApi'

export interface Category {
  id: number
  name: string
  description?: string
  parentId?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  children?: Category[]
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: number
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  parentId?: number
  isActive?: boolean
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: (response: { success: boolean; data: Category[] }) => response.data,
    }),
    getCategoriesFlat: builder.query<Category[], void>({
      query: () => '/categories/flat',
      providesTags: ['Category'],
      transformResponse: (response: { success: boolean; data: Category[] }) => response.data,
    }),
    getCategoryById: builder.query<Category, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
      transformResponse: (response: { success: boolean; data: Category }) => response.data,
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
      transformResponse: (response: { success: boolean; data: Category }) => response.data,
    }),
    updateCategory: builder.mutation<Category, { id: number; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
      transformResponse: (response: { success: boolean; data: Category }) => response.data,
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoriesFlatQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi

