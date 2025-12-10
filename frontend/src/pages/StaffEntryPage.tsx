import { useState } from 'react'
import { Container, Paper, Typography, Box, TextField, Button, Alert } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { enableStaffMode } from '../store/slices/staffSlice'

const StaffEntryPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [staffName, setStaffName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleEnterStaffMode = () => {
    if (!staffName.trim()) {
      setError('Please enter your name')
      return
    }

    dispatch(enableStaffMode({ name: staffName.trim() }))
    navigate('/staff/billing')
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Retail Billing System
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Staff Mode
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your name to start billing for customers
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={staffName}
              onChange={(e) => {
                setStaffName(e.target.value)
                setError(null)
              }}
              margin="normal"
              autoFocus
              placeholder="Enter your name"
            />

            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleEnterStaffMode}
            >
              Enter Staff Mode
            </Button>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
            >
              Admin Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default StaffEntryPage

