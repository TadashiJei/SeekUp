import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Slide, useMediaQuery, useTheme } from '@mui/material';
import {
  CloseRounded as CloseIcon,
  GetAppRounded as InstallIcon,
  ArrowRightAltRounded as ArrowIcon
} from '@mui/icons-material';

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if the user has already dismissed the prompt
  const checkPromptDismissed = () => {
    const dismissedTime = localStorage.getItem('pwaPromptDismissed');
    if (dismissedTime) {
      const now = new Date().getTime();
      const dismissedDate = parseInt(dismissedTime);
      
      // Show prompt again after 7 days
      if (now - dismissedDate < 7 * 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (window.matchMedia('(display-mode: standalone)').matches || checkPromptDismissed()) {
      return;
    }

    const handler = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setInstallable(true);
      
      // Wait a moment before showing the prompt to not disrupt initial user experience
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Handle when PWA is successfully installed
    window.addEventListener('appinstalled', (evt) => {
      setShowPrompt(false);
      setInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    });
  };

  const handleDismiss = () => {
    // Save dismissal time
    localStorage.setItem('pwaPromptDismissed', new Date().getTime().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || !installable) return null;

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Box
        className="install-prompt"
        sx={{
          position: 'fixed',
          bottom: { xs: 65, sm: 70 }, // Above bottom navigation
          left: 0,
          right: 0,
          backgroundColor: 'background.paper',
          padding: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 999,
          maxWidth: '100%',
          margin: '0 auto',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <InstallIcon color="primary" sx={{ mr: 1.5, fontSize: 28, display: { xs: 'none', sm: 'block' } }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {isMobile ? 'Add to Home Screen' : 'Install SEEKUP App'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'block' } 
              }}
            >
              Access faster, even offline
            </Typography>
          </Box>
        </Box>
          
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            onClick={handleInstall}
            endIcon={<ArrowIcon />}
            sx={{ 
              mr: { xs: 1, sm: 1.5 },
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            Install Now
          </Button>
          <IconButton onClick={handleDismiss} size="small" edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    </Slide>
  );
}

export default InstallPrompt;
