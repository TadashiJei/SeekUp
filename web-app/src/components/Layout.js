import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuOpen = Boolean(anchorEl);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };
  
  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };
  
  // Generate navigation items based on user type
  const getNavItems = () => {
    const navItems = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard', 
        roles: ['volunteer', 'organization', 'admin'] 
      },
      { 
        text: 'Events', 
        icon: <EventIcon />, 
        path: '/events', 
        roles: ['volunteer', 'organization', 'admin'] 
      },
    ];
    
    // Organization-specific items
    if (user?.userType === 'organization') {
      navItems.push(
        { 
          text: 'Analytics', 
          icon: <AnalyticsIcon />, 
          path: '/analytics', 
          roles: ['organization', 'admin'] 
        },
        { 
          text: 'Verification', 
          icon: <VerifiedIcon />, 
          path: '/verification', 
          roles: ['organization'] 
        }
      );
    }
    
    // Admin-specific items
    if (user?.userType === 'admin') {
      navItems.push(
        { 
          text: 'Analytics', 
          icon: <AnalyticsIcon />, 
          path: '/analytics', 
          roles: ['organization', 'admin'] 
        }
      );
    }
    
    return navItems.filter(item => item.roles.includes(user?.userType));
  };
  
  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          SEEKUP
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Page title based on current route */}
            {getNavItems().find(item => item.path === location.pathname)?.text || 'SEEKUP'}
          </Typography>
          
          {/* User profile menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={menuOpen ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px' // AppBar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
