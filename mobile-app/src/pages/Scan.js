import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FlashOn as FlashIcon,
  FlashOff as FlashOffIcon,
  CameraAlt as CameraIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { storePendingCheckIn } from '../utils/offlineDataManager';

function Scan() {
  const navigate = useNavigate();
  // Using user in offline check and permission validation
  const { user: currentUser } = useAuth();
  const scannerRef = useRef(null);
  const qrCodeScanner = useRef(null);
  
  // States
  const [scanning, setScanning] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle camera initialization
  useEffect(() => {
    let mounted = true;
    
    // Get available cameras
    Html5Qrcode.getCameras()
      .then(devices => {
        if (mounted) {
          setCameras(devices);
          if (devices.length > 0) {
            setSelectedCamera(devices[0].id);
          }
        }
      })
      .catch(err => {
        console.error('Error getting cameras', err);
        if (mounted) {
          setError('Unable to access camera. Please check permissions and try again.');
        }
      });
    
    return () => {
      mounted = false;
      // Cleanup function runs when component unmounts
      if (qrCodeScanner.current) {
        try {
          if (qrCodeScanner.current.isScanning) {
            // Try/catch to handle potential errors during stop
            try {
              qrCodeScanner.current.stop().catch(err => {
                console.log('Ignoring error during unmount cleanup:', err);
              });
            } catch (err) {
              console.log('Caught error during scanner stop:', err);
            }
          }
          
          // Reset the ref
          qrCodeScanner.current = null;
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
      
      // Directly handle scanner DOM element cleanup regardless of qrCodeScanner ref state
      try {
        const scannerElement = document.getElementById('qr-reader');
        if (scannerElement) {
          // Remove all event listeners and clear all child nodes
          const newElement = scannerElement.cloneNode(false);
          if (scannerElement.parentNode) {
            scannerElement.parentNode.replaceChild(newElement, scannerElement);
          }
        }
      } catch (err) {
        console.error('Error cleaning up scanner element:', err);
      }
    };
  }, []);
  
  // Start scanning
  const startScanner = () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }
    
    setError(null);
    setScanning(true);
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
    };
    
    // Initialize scanner
    qrCodeScanner.current = new Html5Qrcode('qr-reader');
    
    qrCodeScanner.current.start(
      selectedCamera, 
      config,
      onScanSuccess,
      onScanFailure
    )
    .catch(err => {
      console.error('Error starting scanner', err);
      setScanning(false);
      setError('Failed to start camera. Please check permissions and try again.');
    });
  };
  
  // Stop scanning
  const stopScanner = () => {
    if (!qrCodeScanner.current) return;
    
    try {
      // Only attempt to stop if scanner is running
      if (qrCodeScanner.current.isScanning) {
        qrCodeScanner.current.stop()
          .then(() => {
            setScanning(false);
            
            // Clear the scanner element to prevent DOM errors
            const scannerElement = document.getElementById('qr-reader');
            if (scannerElement) {
              // Replace the element instead of removing children one by one
              const newElement = scannerElement.cloneNode(false);
              if (scannerElement.parentNode) {
                scannerElement.parentNode.replaceChild(newElement, scannerElement);
              }
            }
            
            qrCodeScanner.current = null;
          })
          .catch(err => {
            console.error('Error stopping scanner', err);
            setError('Error stopping scanner');
            setScanning(false);
            qrCodeScanner.current = null;
          });
      } else {
        setScanning(false);
        qrCodeScanner.current = null;
      }
    } catch (err) {
      console.error('Error stopping scanner', err);
      setScanning(false);
      qrCodeScanner.current = null;
    }
  };
  
  // Toggle flashlight/torch
  const toggleTorch = () => {
    if (!qrCodeScanner.current || !scanning) return;
    
    try {
      qrCodeScanner.current.applyVideoConstraints({
        advanced: [{ torch: !torchEnabled }]
      })
      .then(() => {
        setTorchEnabled(!torchEnabled);
      })
      .catch(err => {
        console.error('Error toggling torch', err);
        setError('Torch not available on this device');
      });
    } catch (err) {
      console.error('Error applying video constraints', err);
      setError('Torch not available on this device');
    }
  };
  
  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    // Capture the mounted state at the start of the function
    let isMounted = true;
    
    // Create a cleanup function to ensure we don't update state after unmounting
    const handleCleanup = () => {
      if (!isMounted) return;
      
      try {
        // Clear the scanner element to prevent DOM errors
        const scannerElement = document.getElementById('qr-reader');
        if (scannerElement) {
          // Replace the element instead of removing children one by one
          const newElement = scannerElement.cloneNode(false);
          if (scannerElement.parentNode) {
            scannerElement.parentNode.replaceChild(newElement, scannerElement);
          }
        }
      } catch (err) {
        console.error('Error in scan success cleanup:', err);
      }
    };
    
    if (!isMounted) return;
    setScanning(false);
    setScanResult(decodedText);
    setProcessing(true);
    
    try {
      // Stop scanner after successful scan
      if (qrCodeScanner.current) {
        try {
          if (qrCodeScanner.current.isScanning) {
            await qrCodeScanner.current.stop();
          }
          qrCodeScanner.current = null;
        } catch (err) {
          console.error('Error stopping scanner after successful scan:', err);
        } finally {
          handleCleanup();
        }
      }
      
      // Check if we're offline
      if (!navigator.onLine) {
        // Store check-in data for later sync
        await storePendingCheckIn({
          eventId: decodedText,
          userId: currentUser?.id,
          timestamp: new Date().toISOString()
        });
        
        if (isMounted) {
          setSuccessMessage('Check-in stored offline. Will sync when online.');
          setSuccessSnackbar(true);
          setProcessing(false);
        }
        return;
      }
      
      // Online - process immediately
      const response = await axios.post('/api/events/check-in', { 
        eventId: decodedText,
        userId: currentUser?.id 
      });
      
      if (isMounted) {
        if (response.data.success) {
          setSuccessMessage(response.data.message || 'Check-in successful!');
          setSuccessSnackbar(true);
        } else {
          setError(response.data.message || 'Check-in failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error processing scan', err);
      if (isMounted) {
        setError('Error processing scan. Please try again.');
      }
    } finally {
      if (isMounted) {
        setProcessing(false);
      }
    }
    
    // Define cleanup function
    return () => {
      isMounted = false;
    };
  };
  
  // Handle scan failure
  const onScanFailure = (error) => {
    // Ignoring errors since the scanner continuously reports errors when no QR code is found
    // console.error('QR scan error', error);
  };
  
  // Reset scanner and try again
  const handleReset = () => {
    setScanResult(null);
    setError(null);
    startScanner();
  };
  
  // Handle manual entry of code
  const handleManualEntry = () => {
    // This could open a dialog for manual entry
    // For now just navigate to events list
    navigate('/explore');
  };
  
  return (
    <Box className="page-content">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton edge="start" onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
          Scan QR Code
        </Typography>
      </Box>
      
      {/* Scanner Area */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderRadius: 3, 
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Camera Selection */}
        <FormControl sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
          <InputLabel id="camera-select-label">Select Camera</InputLabel>
          <Select
            labelId="camera-select-label"
            id="camera-select"
            value={selectedCamera}
            label="Select Camera"
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            {cameras.map((camera) => (
              <MenuItem key={camera.id} value={camera.id}>
                {camera.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Camera View */}
        <Box 
          id="qr-reader" 
          ref={scannerRef}
          sx={{ 
            width: '100%', 
            maxWidth: 400,
            height: 400,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {!scanning && !scanResult && !processing && (
            <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
              <QrCodeIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
              <Typography variant="body1" sx={{ mb: 2 }}>
                Position the QR code inside the frame
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<CameraIcon />}
                onClick={startScanner}
                disabled={!selectedCamera}
              >
                Start Scanning
              </Button>
            </Box>
          )}
          
          {processing && (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress color="primary" size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Processing check-in...
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Camera Controls */}
        {scanning && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 400,
            mt: 2 
          }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={stopScanner}
            >
              Cancel
            </Button>
            
            <IconButton 
              color={torchEnabled ? 'warning' : 'default'} 
              onClick={toggleTorch}
              disabled={!scanning}
            >
              {torchEnabled ? <FlashIcon /> : <FlashOffIcon />}
            </IconButton>
          </Box>
        )}
      </Paper>
      
      {/* Instructions */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. Scan the QR code displayed at the event location
        </Typography>
        <Typography variant="body2" paragraph>
          2. Make sure the QR code is well-lit and fully visible
        </Typography>
        <Typography variant="body2" paragraph>
          3. Hold your device steady while scanning
        </Typography>
        
        <Button
          variant="text"
          color="primary"
          fullWidth
          onClick={handleManualEntry}
          sx={{ mt: 2 }}
        >
          Search Events Instead
        </Button>
      </Paper>
      
      {/* Error Alert */}
      <Dialog open={!!error} onClose={() => setError(null)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={handleReset}
            autoFocus
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessSnackbar(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Scan;
