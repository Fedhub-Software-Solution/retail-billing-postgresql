# Retail Billing Application - Database Schema Design

## 1. Database Overview

**Database Name**: `retail_billing_db`
**Character Set**: UTF-8
**Collation**: utf8_general_ci

## 2. Entity Relationship Diagram (ERD)

```
Users ──┐
        │
        ├──> Sales (created_by)
        └──> Sales (updated_by)

Products ──┐
           │
           └──> SaleItems

Customers ──┐
            │
            └──> Sales

Sales ──┐
        │
        └──> SaleItems

Categories ──┐
             │
             └──> Products

Taxes ──┐
        │
        └──> Sales

Payments ──┐
           │
           └──> Sales
```

## 3. Database Tables

### 3.1 Users Table
**Purpose**: Store system users (admin, managers, cashiers)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

**Roles**: `admin`, `manager`, `cashier`, `staff`

### 3.2 Categories Table
**Purpose**: Product categories for organization

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);
```

### 3.3 Products Table
**Purpose**: Store product information

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    barcode VARCHAR(100) UNIQUE,
    unit_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_stock ON products(stock_quantity);
```

### 3.4 Customers Table
**Purpose**: Store customer information

```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'India',
    customer_type VARCHAR(20) DEFAULT 'retail',
    credit_limit DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(first_name, last_name);
```

**Customer Types**: `retail`, `wholesale`, `corporate`

### 3.5 Sales Table
**Purpose**: Store sales transactions

```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_invoice ON sales(invoice_number);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_created_by ON sales(created_by);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
```

**Payment Status**: `pending`, `paid`, `partial`, `cancelled`
**Payment Methods**: `cash`, `card`, `upi`, `netbanking`, `wallet`, `credit`

### 3.6 Sale Items Table
**Purpose**: Store individual items in a sale

```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
```

### 3.7 Payments Table
**Purpose**: Store payment transactions

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

### 3.8 Inventory Transactions Table
**Purpose**: Track inventory movements

```sql
CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_trans_product ON inventory_transactions(product_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_reference ON inventory_transactions(reference_type, reference_id);
```

**Transaction Types**: `sale`, `purchase`, `return`, `adjustment`, `damage`, `transfer`

### 3.9 Discounts Table
**Purpose**: Store discount rules and coupons

```sql
CREATE TABLE discounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(is_active);
```

**Discount Types**: `percentage`, `fixed`

### 3.10 Settings Table
**Purpose**: Store application settings

```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Common Settings**:
- `store_name`
- `store_address`
- `store_phone`
- `store_email`
- `tax_rate`
- `currency_symbol`
- `invoice_prefix`
- `low_stock_alert`

## 4. Database Views

### 4.1 Sales Summary View
```sql
CREATE VIEW sales_summary AS
SELECT 
    DATE(sale_date) as sale_date,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    SUM(tax_amount) as total_tax,
    SUM(discount_amount) as total_discount
FROM sales
WHERE payment_status != 'cancelled'
GROUP BY DATE(sale_date);
```

### 4.2 Product Sales View
```sql
CREATE VIEW product_sales_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    SUM(si.quantity) as total_quantity_sold,
    SUM(si.line_total) as total_revenue
FROM products p
JOIN sale_items si ON p.id = si.product_id
JOIN sales s ON si.sale_id = s.id
WHERE s.payment_status != 'cancelled'
GROUP BY p.id, p.name, p.sku;
```

## 5. Database Functions

### 5.1 Generate Invoice Number
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    prefix VARCHAR(10) := 'INV';
    today DATE := CURRENT_DATE;
    date_str VARCHAR(8) := TO_CHAR(today, 'YYYYMMDD');
    seq_num INTEGER;
    invoice_num VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM sales
    WHERE invoice_number LIKE prefix || '-' || date_str || '-%';
    
    invoice_num := prefix || '-' || date_str || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Update Stock on Sale
```sql
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_sale();
```

## 6. Database Constraints

- Foreign key constraints for referential integrity
- Unique constraints on SKU, barcode, invoice numbers
- Check constraints for positive values (quantities, prices)
- Not null constraints on required fields
- Default values for common fields

## 7. Indexes Strategy

- Primary keys (automatic indexes)
- Foreign keys (for join performance)
- Frequently queried columns (dates, status fields)
- Search columns (names, codes, SKUs)
- Composite indexes for common query patterns

## 8. Data Relationships Summary

- **Users** → **Sales** (1:N) - One user can create many sales
- **Customers** → **Sales** (1:N) - One customer can have many sales
- **Sales** → **Sale Items** (1:N) - One sale has many items
- **Products** → **Sale Items** (1:N) - One product can be in many sales
- **Categories** → **Products** (1:N) - One category has many products
- **Sales** → **Payments** (1:N) - One sale can have multiple payments

