import { Outlet } from 'react-router-dom'
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Logout } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { disableStaffMode } from '../../store/slices/staffSlice'
import { useNavigate } from 'react-router-dom'
import ToastContainer from '../common/ToastContainer'

const StaffLayout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const staffName = useSelector((state: RootState) => state.staff.staffName)

  const handleExitStaffMode = () => {
    dispatch(disableStaffMode())
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Retail Billing System - Staff Mode
            {staffName && ` (${staffName})`}
          </Typography>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleExitStaffMode}
          >
            Exit Staff Mode
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          marginTop: '64px',
          width: '100%',
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
      <ToastContainer />
    </Box>
  )
}

export default StaffLayout

