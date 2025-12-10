import { baseApi } from './baseApi'

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
      transformResponse: (response: { success: boolean; data: User }) => response.data,
    }),
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { success: boolean; data: User }) => response.data,
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/profile/password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } = authApi

