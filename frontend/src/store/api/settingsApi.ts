import { baseApi } from './baseApi'

export interface Setting {
  id: number
  key: string
  value: string
  type: string
  description?: string
  updatedAt: string
}

export interface UpdateSettingRequest {
  value: string
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<Setting[], void>({
      query: () => '/settings',
      providesTags: ['Product'],
      transformResponse: (response: { success: boolean; data: Setting[] }) => response.data,
    }),
    getSettingByKey: builder.query<Setting, string>({
      query: (key) => `/settings/${encodeURIComponent(key)}`,
      providesTags: (result, error, key) => [{ type: 'Product', id: key }],
      transformResponse: (response: { success: boolean; data: Setting }) => response.data,
    }),
    updateSetting: builder.mutation<Setting, { key: string; data: UpdateSettingRequest }>({
      query: ({ key, data }) => ({
        url: `/settings/${encodeURIComponent(key)}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { key }) => [{ type: 'Product', id: key }, 'Product'],
      transformResponse: (response: { success: boolean; data: Setting }) => response.data,
    }),
  }),
})

export const { useGetSettingsQuery, useGetSettingByKeyQuery, useUpdateSettingMutation } = settingsApi

