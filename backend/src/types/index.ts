// User Types
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserPayload {
  id: number
  email: string
  role: string
}

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Array<{
    field: string
    message: string
  }>
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  phone?: string
}

export interface AuthResponse {
  user: {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

// Database Types
export interface DatabaseUser {
  id: number
  username: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: string
  phone?: string
  is_active: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

// Category Types
export interface Category {
  id: number
  name: string
  description?: string
  parentId?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  children?: Category[]
}

export interface DatabaseCategory {
  id: number
  name: string
  description?: string
  parent_id?: number
  is_active: boolean
  created_at: Date
  updated_at: Date
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

// Product Types
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
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseProduct {
  id: number
  sku: string
  name: string
  description?: string
  category_id?: number
  barcode?: string
  unit_price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level: number
  unit: string
  image_url?: string
  is_active: boolean
  tax_rate: number
  created_at: Date
  updated_at: Date
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

// Customer Types
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
  createdAt: Date
  updatedAt: Date
  totalPurchases?: number
}

export interface DatabaseCustomer {
  id: number
  customer_code: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  customer_type: string
  credit_limit: number
  is_active: boolean
  created_at: Date
  updated_at: Date
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

export interface CustomerQueryParams {
  page?: number
  limit?: number
  search?: string
  customerType?: string
}

export interface CustomerStatistics {
  totalCustomers: number
  activeCustomers: number
  totalPurchases: number
  averagePurchaseValue: number
}

// Sale Types
export interface SaleItem {
  id?: number
  productId: number
  productName?: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  taxAmount?: number
  lineTotal: number
}

export interface Sale {
  id: number
  invoiceNumber: string
  customerId?: number
  customerName?: string
  saleDate: Date
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentStatus: string
  paymentMethod?: string
  notes?: string
  createdBy?: number
  createdByName?: string
  items: SaleItem[]
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseSale {
  id: number
  invoice_number: string
  customer_id?: number
  sale_date: Date
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: string
  payment_method?: string
  notes?: string
  created_by?: number
  updated_by?: number
  created_at: Date
  updated_at: Date
}

export interface DatabaseSaleItem {
  id: number
  sale_id: number
  product_id: number
  quantity: number
  unit_price: number
  discount_amount: number
  tax_amount: number
  line_total: number
  created_at: Date
}

export interface CreateSaleRequest {
  customerId?: number
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    discountAmount?: number
  }>
  discountAmount?: number
  paymentMethod?: string
  notes?: string
}

export interface UpdateSaleRequest {
  customerId?: number
  items?: Array<{
    productId: number
    quantity: number
    unitPrice: number
    discountAmount?: number
  }>
  discountAmount?: number
  paymentMethod?: string
  notes?: string
}

export interface SaleQueryParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  customerId?: number
  paymentStatus?: string
  createdBy?: number
}

export interface ReturnItem {
  saleItemId: number
  quantity: number
  reason?: string
}

export interface ProcessReturnRequest {
  items: ReturnItem[]
  refundMethod: string
  notes?: string
}

// Payment Types
export interface Payment {
  id: number
  saleId: number
  paymentMethod: string
  amount: number
  transactionId?: string
  paymentDate: Date
  notes?: string
  createdBy?: number
  createdAt: Date
}

export interface DatabasePayment {
  id: number
  sale_id: number
  payment_method: string
  amount: number
  transaction_id?: string
  payment_date: Date
  notes?: string
  created_by?: number
  created_at: Date
}

export interface CreatePaymentRequest {
  saleId: number
  paymentMethod: string
  amount: number
  transactionId?: string
  notes?: string
}

export interface PaymentQueryParams {
  page?: number
  limit?: number
  saleId?: number
  paymentMethod?: string
  startDate?: string
  endDate?: string
}

// Discount Types
export interface Discount {
  id: number
  code?: string
  name: string
  discountType: string
  discountValue: number
  minPurchaseAmount: number
  maxDiscountAmount?: number
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  usedCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseDiscount {
  id: number
  code?: string
  name: string
  discount_type: string
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  start_date?: Date
  end_date?: Date
  usage_limit?: number
  used_count: number
  is_active: boolean
  created_at: Date
  updated_at: Date
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

// Settings Types
export interface Setting {
  id: number
  key: string
  value: string
  type: string
  description?: string
  updatedAt: Date
}

export interface DatabaseSetting {
  id: number
  key: string
  value?: string
  type: string
  description?: string
  updated_at: Date
}

export interface UpdateSettingRequest {
  value: string
}

// Inventory Transaction Types
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
  createdAt: Date
}

export interface DatabaseInventoryTransaction {
  id: number
  product_id: number
  transaction_type: string
  quantity: number
  reference_type?: string
  reference_id?: number
  notes?: string
  created_by?: number
  created_at: Date
}

export interface CreateInventoryTransactionRequest {
  productId: number
  transactionType: string
  quantity: number
  referenceType?: string
  referenceId?: number
  notes?: string
}

// Express Request with User
import { Request } from 'express'

export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: UserPayload
}
