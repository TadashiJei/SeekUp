import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BottomNavigation as MuiBottomNavigation, 
  BottomNavigationAction, 
  Paper 
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as ExploreIcon,
  QrCodeScanner as ScanIcon,
  EmojiEvents as PassportIcon,
  Person as ProfileIcon,
  Event as EventIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function AppBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [value, setValue] = useState(0);
  
  // Define path-to-index mapping
  const pathToIndex = {
    '/': 0,
    '/home': 0,
    '/explore': 1,
    '/scan': 2, // QR code scanner for volunteers
    '/passport': 3,
    '/events/create': 2, // For organizations, this is in position 2
    '/profile': 4
  };
  
  // Update the selected tab based on the current path
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Exact match
    if (pathToIndex[currentPath] !== undefined) {
      setValue(pathToIndex[currentPath]);
    }
    // Match the base path for nested routes
    else if (currentPath.startsWith('/events/') && currentPath !== '/events/create') {
      setValue(1); // Explore tab (since events are usually accessed from there)
    }
  }, [location.pathname]);
  
  // Don't show navigation on authentication pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} 
      elevation={3}
      className="bottom-navigation"
    >
      <MuiBottomNavigation
        showLabels
        value={value}
        onChange={(e, newValue) => setValue(newValue)}
        sx={{ width: '100%' }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeIcon />} 
          onClick={() => handleNavigation('/home')} 
        />
        
        <BottomNavigationAction 
          label="Explore" 
          icon={<ExploreIcon />} 
          onClick={() => handleNavigation('/explore')} 
        />
        
        {user?.userType === 'volunteer' ? (
          <BottomNavigationAction 
            label="Scan" 
            icon={<ScanIcon />} 
            onClick={() => handleNavigation('/scan')} 
          />
        ) : (
          <BottomNavigationAction 
            label="Create" 
            icon={<AddIcon />} 
            onClick={() => handleNavigation('/events/create')} 
          />
        )}
        
        {user?.userType === 'volunteer' && (
          <BottomNavigationAction 
            label="Passport" 
            icon={<PassportIcon />} 
            onClick={() => handleNavigation('/passport')} 
          />
        )}
        
        <BottomNavigationAction 
          label="Profile" 
          icon={<ProfileIcon />} 
          onClick={() => handleNavigation('/profile')} 
        />
      </MuiBottomNavigation>
    </Paper>
  );
}

export default AppBottomNavigation;
