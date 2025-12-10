import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const drawerWidth = 240

const staffMenuItems = [
  { text: 'Billing', icon: <ShoppingCartIcon />, path: '/staff/billing' },
]

const StaffSidebar = () => {
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)
  const location = useLocation()

  const handleClose = () => {
    dispatch(setSidebarOpen(false))
  }

  return (
    <Drawer
      variant="temporary"
      open={sidebarOpen}
      onClose={handleClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          marginTop: { xs: '56px', sm: '64px' },
        },
      }}
    >
      <List>
        {staffMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={handleClose}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default StaffSidebar

