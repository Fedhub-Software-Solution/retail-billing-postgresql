# Retail Billing Application - Frontend Architecture

## 1. Frontend Technology Stack

- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **Data Fetching**: RTK Query
- **Routing**: React Router v6
- **UI Library**: Material-UI / Ant Design / Tailwind CSS
- **Form Handling**: React Hook Form
- **Validation**: Yup / Zod
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Language**: TypeScript (recommended)

## 2. Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   ├── ErrorBoundary/
│   │   │   └── ConfirmDialog/
│   │   ├── forms/
│   │   │   ├── FormInput/
│   │   │   ├── FormSelect/
│   │   │   ├── FormDatePicker/
│   │   │   └── FormCheckbox/
│   │   └── layout/
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       ├── Footer/
│   │       └── Layout/
│   ├── features/                # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── api/
│   │   │       └── authApi.ts
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   └── ProductFilters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ProductsPage.tsx
│   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   └── AddProductPage.tsx
│   │   │   └── api/
│   │   │       └── productsApi.ts
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   │   ├── SaleForm.tsx
│   │   │   │   ├── SaleItemList.tsx
│   │   │   │   ├── SaleSummary.tsx
│   │   │   │   ├── BillingInterface.tsx
│   │   │   │   └── ProductSearch.tsx
│   │   │   ├── pages/
│   │   │   │   ├── SalesPage.tsx
│   │   │   │   ├── NewSalePage.tsx
│   │   │   │   └── SaleDetailPage.tsx
│   │   │   └── api/
│   │   │       └── salesApi.ts
│   │   ├── customers/
│   │   │   ├── components/
│   │   │   │   ├── CustomerList.tsx
│   │   │   │   ├── CustomerForm.tsx
│   │   │   │   └── CustomerCard.tsx
│   │   │   ├── pages/
│   │   │   │   ├── CustomersPage.tsx
│   │   │   │   └── CustomerDetailPage.tsx
│   │   │   └── api/
│   │   │       └── customersApi.ts
│   │   ├── categories/
│   │   │   ├── components/
│   │   │   │   ├── CategoryTree.tsx
│   │   │   │   └── CategoryForm.tsx
│   │   │   ├── pages/
│   │   │   │   └── CategoriesPage.tsx
│   │   │   └── api/
│   │   │       └── categoriesApi.ts
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   └── ReportFilters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ReportsPage.tsx
│   │   │   │   └── DashboardPage.tsx
│   │   │   └── api/
│   │   │       └── reportsApi.ts
│   │   └── inventory/
│   │       ├── components/
│   │       │   ├── InventoryList.tsx
│   │       │   └── StockAlert.tsx
│   │       ├── pages/
│   │       │   └── InventoryPage.tsx
│   │       └── api/
│   │           └── inventoryApi.ts
│   ├── store/                   # Redux store
│   │   ├── api/
│   │   │   ├── baseApi.ts        # Base RTK Query API
│   │   │   └── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   └── cartSlice.ts
│   │   └── store.ts              # Store configuration
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePagination.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Currency, date formatters
│   │   ├── validators.ts         # Validation functions
│   │   ├── constants.ts          # Constants
│   │   └── helpers.ts            # Helper functions
│   ├── types/                    # TypeScript types
│   │   ├── api.types.ts
│   │   ├── product.types.ts
│   │   ├── sale.types.ts
│   │   └── user.types.ts
│   ├── constants/                # Constants
│   │   ├── routes.ts
│   │   ├── roles.ts
│   │   └── config.ts
│   ├── services/                 # API services
│   │   ├── apiClient.ts          # Axios instance
│   │   └── tokenService.ts       # Token management
│   ├── styles/                   # Global styles
│   │   ├── theme.ts              # Theme configuration
│   │   └── globals.css
│   ├── App.tsx                   # Main App component
│   ├── main.tsx                  # Entry point
│   └── routes.tsx                # Route configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
```

## 3. Redux Store Architecture

### 3.1 Store Configuration

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import cartSlice from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authSlice,
    ui: uiSlice,
    cart: cartSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 3.2 RTK Query Base API

```typescript
// store/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Product', 'Sale', 'Customer', 'Category', 'User'],
  endpoints: () => ({}),
});
```

### 3.3 Feature API Slices

```typescript
// features/products/api/productsApi.ts
import { baseApi } from '@/store/api/baseApi';
import { Product, ProductListResponse } from '@/types/product.types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: number;
    }>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

## 4. Redux Slices

### 4.1 Auth Slice

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 4.2 Cart Slice (for Billing Interface)

```typescript
// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product.types';

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  customerId: number | null;
}

const initialState: CartState = {
  items: [],
  customerId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.product.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          product: action.payload.product,
          quantity: action.payload.quantity,
          discount: 0,
        });
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const item = state.items.find((item) => item.product.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setCustomer: (state, action: PayloadAction<number | null>) => {
      state.customerId = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.customerId = null;
    },
  },
});

export const { addItem, removeItem, updateQuantity, setCustomer, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

## 5. Routing Structure

```typescript
// routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/reports/pages/DashboardPage';
import ProductsPage from '@/features/products/pages/ProductsPage';
import SalesPage from '@/features/sales/pages/SalesPage';
import NewSalePage from '@/features/sales/pages/NewSalePage';
import CustomersPage from '@/features/customers/pages/CustomersPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
      {
        path: 'sales/new',
        element: <NewSalePage />,
      },
      {
        path: 'sales/:id',
        element: <SaleDetailPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
    ],
  },
]);
```

## 6. Component Patterns

### 6.1 Page Component Pattern

```typescript
// features/products/pages/ProductsPage.tsx
import { useState } from 'react';
import { useGetProductsQuery } from '@/features/products/api/productsApi';
import ProductList from '@/features/products/components/ProductList';
import ProductFilters from '@/features/products/components/ProductFilters';

const ProductsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
  });

  const { data, isLoading, error } = useGetProductsQuery(filters);

  return (
    <div>
      <h1>Products</h1>
      <ProductFilters filters={filters} onFilterChange={setFilters} />
      <ProductList products={data?.products} loading={isLoading} error={error} />
    </div>
  );
};
```

### 6.2 Form Component Pattern

```typescript
// features/products/components/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateProductMutation } from '@/features/products/api/productsApi';

const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  unitPrice: yup.number().positive('Price must be positive').required(),
});

const ProductForm = ({ onSuccess }) => {
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(productSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createProduct(data).unwrap();
      onSuccess();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

## 7. State Management Strategy

### 7.1 Server State (RTK Query)
- Product data
- Sales data
- Customer data
- Reports data
- All API responses

### 7.2 Client State (Redux Slices)
- Authentication state
- UI state (modals, sidebars)
- Cart state (for billing)
- Form state (if complex)

### 7.3 Local State (useState)
- Component-specific UI state
- Form inputs (use React Hook Form)
- Temporary calculations

## 8. Performance Optimizations

- Code splitting with React.lazy()
- Memoization with React.memo()
- useMemo and useCallback for expensive operations
- Virtual scrolling for long lists
- Image lazy loading
- RTK Query caching and invalidation
- Debounced search inputs

## 9. Error Handling

- Error boundaries for component errors
- RTK Query error handling
- Toast notifications for user feedback
- Form validation errors
- Network error handling

## 10. Responsive Design

- Mobile-first approach
- Breakpoints: mobile, tablet, desktop
- Touch-friendly interfaces
- Responsive tables and grids
- Mobile-optimized billing interface

