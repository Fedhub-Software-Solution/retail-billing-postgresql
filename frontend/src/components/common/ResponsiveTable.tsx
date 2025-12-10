import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface Column {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  minWidth?: number
  format?: (value: any) => ReactNode
}

interface ResponsiveTableProps {
  columns: Column[]
  rows: any[]
  emptyMessage?: string
  onRowClick?: (row: any) => void
}

const ResponsiveTable = ({ columns, rows, emptyMessage = 'No data available', onRowClick }: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop Table */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {rows.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rows.map((row, index) => (
              <Paper
                key={index}
                sx={{ p: 2, cursor: onRowClick ? 'pointer' : 'default' }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = row[column.id]
                  return (
                    <Box key={column.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {column.label}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" align={column.align || 'right'}>
                        {column.format ? column.format(value) : value}
                      </Typography>
                    </Box>
                  )
                })}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}

export default ResponsiveTable

