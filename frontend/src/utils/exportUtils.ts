/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    // Headers
    csvHeaders.join(','),
    // Data rows
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header] || ''
          // Handle values with commas, quotes, or newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export sales summary to CSV
 */
export const exportSalesSummary = (summary: any[], totals: any) => {
  const data = [
    // Summary rows
    ...summary.map((item) => ({
      Period: item.period,
      'Total Sales': item.totalSales,
      'Total Revenue': `₹${item.totalRevenue.toFixed(2)}`,
      'Total Tax': `₹${item.totalTax.toFixed(2)}`,
      'Total Discount': `₹${item.totalDiscount.toFixed(2)}`,
      'Average Order Value': `₹${item.averageOrderValue.toFixed(2)}`,
    })),
    // Totals row
    {
      Period: 'TOTAL',
      'Total Sales': totals.totalSales,
      'Total Revenue': `₹${totals.totalRevenue.toFixed(2)}`,
      'Total Tax': `₹${totals.totalTax.toFixed(2)}`,
      'Total Discount': `₹${totals.totalDiscount.toFixed(2)}`,
      'Average Order Value': `₹${totals.averageOrderValue.toFixed(2)}`,
    },
  ]

  exportToCSV(data, 'sales_summary', [
    'Period',
    'Total Sales',
    'Total Revenue',
    'Total Tax',
    'Total Discount',
    'Average Order Value',
  ])
}

/**
 * Export top products to CSV
 */
export const exportTopProducts = (products: any[]) => {
  const data = products.map((product, index) => ({
    Rank: index + 1,
    'Product Name': product.name,
    SKU: product.sku || '',
    Category: product.categoryName || '',
    'Quantity Sold': product.totalQuantity,
    Revenue: `₹${product.totalRevenue.toFixed(2)}`,
    'Sales Count': product.saleCount,
  }))

  exportToCSV(data, 'top_products', [
    'Rank',
    'Product Name',
    'SKU',
    'Category',
    'Quantity Sold',
    'Revenue',
    'Sales Count',
  ])
}

/**
 * Export top customers to CSV
 */
export const exportTopCustomers = (customers: any[]) => {
  const data = customers.map((customer, index) => ({
    Rank: index + 1,
    'Customer Name': `${customer.firstName} ${customer.lastName || ''}`.trim(),
    'Customer Code': customer.customerCode,
    Orders: customer.purchaseCount,
    'Total Spent': `₹${customer.totalSpent.toFixed(2)}`,
    'Average Order Value': `₹${customer.averageOrderValue.toFixed(2)}`,
  }))

  exportToCSV(data, 'top_customers', [
    'Rank',
    'Customer Name',
    'Customer Code',
    'Orders',
    'Total Spent',
    'Average Order Value',
  ])
}

/**
 * Export inventory status to CSV
 */
export const exportInventoryStatus = (inventoryStatus: any) => {
  const data = [
    // Summary
    {
      Metric: 'Out of Stock',
      Value: inventoryStatus.summary.outOfStock,
    },
    {
      Metric: 'Low Stock',
      Value: inventoryStatus.summary.lowStock,
    },
    {
      Metric: 'In Stock',
      Value: inventoryStatus.summary.inStock,
    },
    {
      Metric: 'Active Products',
      Value: inventoryStatus.summary.activeProducts,
    },
    {
      Metric: 'Inactive Products',
      Value: inventoryStatus.summary.inactiveProducts,
    },
    {
      Metric: 'Total Inventory Value',
      Value: `₹${inventoryStatus.summary.totalInventoryValue.toFixed(2)}`,
    },
  ]

  exportToCSV(data, 'inventory_status', ['Metric', 'Value'])

  // Export low stock products separately if available
  if (inventoryStatus.lowStockProducts && inventoryStatus.lowStockProducts.length > 0) {
    const lowStockData = inventoryStatus.lowStockProducts.map((product: any) => ({
      'Product Name': product.name,
      SKU: product.sku || '',
      Category: product.categoryName || '',
      'Current Stock': product.stockQuantity,
      'Min Stock Level': product.minStockLevel,
    }))

    exportToCSV(lowStockData, 'low_stock_products', [
      'Product Name',
      'SKU',
      'Category',
      'Current Stock',
      'Min Stock Level',
    ])
  }
}

/**
 * Export daily sales to CSV
 */
export const exportDailySales = (dailySales: any[]) => {
  const data = dailySales.map((sale) => ({
    Date: new Date(sale.date).toLocaleDateString(),
    'Sales Count': sale.salesCount,
    Revenue: `₹${sale.revenue.toFixed(2)}`,
    Tax: `₹${sale.tax.toFixed(2)}`,
    Discount: `₹${sale.discount.toFixed(2)}`,
    'Average Order Value': `₹${sale.avgOrderValue.toFixed(2)}`,
  }))

  exportToCSV(data, 'daily_sales', [
    'Date',
    'Sales Count',
    'Revenue',
    'Tax',
    'Discount',
    'Average Order Value',
  ])
}

