# Retail Billing Application - Backend API Design

## 1. API Base Configuration

**Base URL**: `/api/v1`
**Content-Type**: `application/json`
**Authentication**: Bearer Token (JWT)

## 2. API Endpoints

### 2.1 Authentication Endpoints

#### POST /api/v1/auth/register
**Description**: Register a new user (Admin only)

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "cashier",
  "phone": "+1234567890"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "cashier"
  },
  "message": "User registered successfully"
}
```

#### POST /api/v1/auth/login
**Description**: User login

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "cashier"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### POST /api/v1/auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/v1/auth/logout
**Description**: User logout

**Headers**: `Authorization: Bearer <token>`

---

### 2.2 Products Endpoints

#### GET /api/v1/products
**Description**: Get all products with pagination and filters

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `search` - Search by name, SKU, barcode
- `categoryId` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Filter by stock availability
- `sortBy` - Sort field (name, price, stock)
- `order` - Sort order (asc, desc)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "sku": "PROD001",
        "name": "Product Name",
        "description": "Product description",
        "categoryId": 1,
        "categoryName": "Electronics",
        "barcode": "1234567890123",
        "unitPrice": 99.99,
        "costPrice": 50.00,
        "stockQuantity": 100,
        "minStockLevel": 10,
        "unit": "pcs",
        "imageUrl": "https://...",
        "taxRate": 18.00,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### GET /api/v1/products/:id
**Description**: Get product by ID

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "PROD001",
    "name": "Product Name",
    ...
  }
}
```

#### POST /api/v1/products
**Description**: Create new product

**Request Body**:
```json
{
  "sku": "PROD001",
  "name": "Product Name",
  "description": "Product description",
  "categoryId": 1,
  "barcode": "1234567890123",
  "unitPrice": 99.99,
  "costPrice": 50.00,
  "stockQuantity": 100,
  "minStockLevel": 10,
  "unit": "pcs",
  "taxRate": 18.00
}
```

#### PUT /api/v1/products/:id
**Description**: Update product

#### DELETE /api/v1/products/:id
**Description**: Soft delete product (set isActive to false)

#### GET /api/v1/products/low-stock
**Description**: Get products with low stock

**Query Parameters**:
- `threshold` - Custom threshold (optional)

---

### 2.3 Categories Endpoints

#### GET /api/v1/categories
**Description**: Get all categories (tree structure)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic items",
      "parentId": null,
      "children": [
        {
          "id": 2,
          "name": "Mobile Phones",
          "parentId": 1,
          "children": []
        }
      ]
    }
  ]
}
```

#### POST /api/v1/categories
**Description**: Create category

#### PUT /api/v1/categories/:id
**Description**: Update category

#### DELETE /api/v1/categories/:id
**Description**: Delete category

---

### 2.4 Customers Endpoints

#### GET /api/v1/customers
**Description**: Get all customers with pagination

**Query Parameters**:
- `page`, `limit`
- `search` - Search by name, phone, email, code
- `customerType` - Filter by type

**Response** (200):
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "customerCode": "CUST001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "customerType": "retail",
        "creditLimit": 1000.00,
        "totalPurchases": 5000.00
      }
    ],
    "pagination": {...}
  }
}
```

#### GET /api/v1/customers/:id
**Description**: Get customer by ID

#### POST /api/v1/customers
**Description**: Create customer

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "customerType": "retail",
  "creditLimit": 1000.00
}
```

#### PUT /api/v1/customers/:id
**Description**: Update customer

#### DELETE /api/v1/customers/:id
**Description**: Soft delete customer

#### GET /api/v1/customers/:id/sales
**Description**: Get all sales for a customer

---

### 2.5 Sales Endpoints

#### GET /api/v1/sales
**Description**: Get all sales with pagination

**Query Parameters**:
- `page`, `limit`
- `startDate`, `endDate` - Date range filter
- `customerId` - Filter by customer
- `paymentStatus` - Filter by payment status
- `createdBy` - Filter by user

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": 1,
        "invoiceNumber": "INV-20240101-0001",
        "customerId": 1,
        "customerName": "John Doe",
        "saleDate": "2024-01-01T10:00:00Z",
        "subtotal": 1000.00,
        "taxAmount": 180.00,
        "discountAmount": 50.00,
        "totalAmount": 1130.00,
        "paymentStatus": "paid",
        "paymentMethod": "cash",
        "items": [
          {
            "id": 1,
            "productId": 1,
            "productName": "Product Name",
            "quantity": 2,
            "unitPrice": 500.00,
            "lineTotal": 1000.00
          }
        ],
        "createdBy": 1,
        "createdByName": "Admin User"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET /api/v1/sales/:id
**Description**: Get sale by ID with full details

#### POST /api/v1/sales
**Description**: Create new sale

**Request Body**:
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 500.00,
      "discountAmount": 0.00
    }
  ],
  "discountAmount": 50.00,
  "paymentMethod": "cash",
  "notes": "Customer notes"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceNumber": "INV-20240101-0001",
    "totalAmount": 1130.00,
    "paymentStatus": "paid",
    ...
  },
  "message": "Sale created successfully"
}
```

#### PUT /api/v1/sales/:id
**Description**: Update sale (only if not paid)

#### DELETE /api/v1/sales/:id
**Description**: Cancel sale (soft delete)

#### POST /api/v1/sales/:id/return
**Description**: Process return/refund

**Request Body**:
```json
{
  "items": [
    {
      "saleItemId": 1,
      "quantity": 1,
      "reason": "Defective product"
    }
  ],
  "refundMethod": "cash"
}
```

#### GET /api/v1/sales/:id/invoice
**Description**: Get invoice PDF (if implemented)

---

### 2.6 Payments Endpoints

#### GET /api/v1/payments
**Description**: Get all payments

**Query Parameters**:
- `page`, `limit`
- `saleId` - Filter by sale
- `paymentMethod` - Filter by method
- `startDate`, `endDate`

#### POST /api/v1/payments
**Description**: Record payment

**Request Body**:
```json
{
  "saleId": 1,
  "paymentMethod": "card",
  "amount": 1130.00,
  "transactionId": "TXN123456",
  "notes": "Payment notes"
}
```

---

### 2.7 Reports Endpoints

#### GET /api/v1/reports/sales-summary
**Description**: Get sales summary

**Query Parameters**:
- `startDate`, `endDate`
- `groupBy` - day, week, month, year

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalSales": 100,
    "totalRevenue": 100000.00,
    "totalTax": 18000.00,
    "totalDiscount": 5000.00,
    "averageOrderValue": 1000.00,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

#### GET /api/v1/reports/top-products
**Description**: Get top selling products

**Query Parameters**:
- `limit` (default: 10)
- `startDate`, `endDate`

#### GET /api/v1/reports/top-customers
**Description**: Get top customers

**Query Parameters**:
- `limit` (default: 10)
- `startDate`, `endDate`

#### GET /api/v1/reports/inventory-status
**Description**: Get inventory status report

#### GET /api/v1/reports/daily-sales
**Description**: Get daily sales breakdown

---

### 2.8 Settings Endpoints

#### GET /api/v1/settings
**Description**: Get all settings

#### GET /api/v1/settings/:key
**Description**: Get setting by key

#### PUT /api/v1/settings/:key
**Description**: Update setting

**Request Body**:
```json
{
  "value": "New Store Name"
}
```

---

### 2.9 Dashboard Endpoints

#### GET /api/v1/dashboard/stats
**Description**: Get dashboard statistics

**Response** (200):
```json
{
  "success": true,
  "data": {
    "todaySales": {
      "count": 25,
      "revenue": 25000.00
    },
    "monthSales": {
      "count": 500,
      "revenue": 500000.00
    },
    "lowStockProducts": 5,
    "pendingPayments": 3,
    "topProducts": [...],
    "recentSales": [...]
  }
}
```

---

## 3. Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 4. Authentication Middleware

All protected routes require:
```
Authorization: Bearer <access_token>
```

## 5. Rate Limiting

- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- Login endpoint: 5 attempts per 15 minutes

## 6. API Versioning

- Current version: v1
- Version specified in URL: `/api/v1/...`
- Future versions: `/api/v2/...`

