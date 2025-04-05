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
  Snackbar
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

function Scan() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
          // Select back camera by default if available
          const backCamera = devices.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('rear')
          );
          setSelectedCamera(backCamera?.id || (devices.length > 0 ? devices[0].id : null));
        }
      })
      .catch(err => {
        console.error('Error getting cameras', err);
        setError('Unable to access camera. Please grant camera permissions.');
      });
      
    return () => {
      mounted = false;
      // Stop scanner if active
      if (qrCodeScanner.current) {
        qrCodeScanner.current.stop()
          .catch(err => console.error('Error stopping scanner', err));
        qrCodeScanner.current = null;
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
    
    qrCodeScanner.current.stop()
      .then(() => {
        setScanning(false);
        qrCodeScanner.current = null;
      })
      .catch(err => {
        console.error('Error stopping scanner', err);
        setError('Error stopping scanner');
      });
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
    // Stop scanner
    stopScanner();
    setScanResult(decodedText);
    
    try {
      // Parse QR code data
      let eventId, action;
      
      // Expect format: seekup://check-in/{eventId} or seekup://event/{eventId}
      if (decodedText.startsWith('seekup://')) {
        const parts = decodedText.split('/');
        action = parts[2];
        eventId = parts[3];
      } else {
        // Try to parse as JSON if it's not in the URI format
        try {
          const data = JSON.parse(decodedText);
          eventId = data.eventId;
          action = data.action;
        } catch (e) {
          // If it's just an ID, assume it's an event ID for check-in
          eventId = decodedText;
          action = 'check-in';
        }
      }
      
      if (!eventId) {
        setError('Invalid QR code format');
        return;
      }
      
      // Process based on action
      if (action === 'check-in') {
        await processCheckIn(eventId);
      } else if (action === 'event') {
        // Navigate to event detail page
        navigate(`/events/${eventId}`);
      } else {
        setError('Unknown QR code action');
      }
    } catch (err) {
      console.error('Error processing QR code', err);
      setError('Failed to process QR code');
    }
  };
  
  // Handle scan failure
  const onScanFailure = (error) => {
    // Ignoring errors since the scanner continuously reports errors when no QR code is found
    // console.error('QR scan error', error);
  };
  
  // Process check-in
  const processCheckIn = async (eventId) => {
    setProcessing(true);
    
    try {
      const response = await axios.post(`/api/events/${eventId}/check-in`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Show success message
      setSuccessMessage(response.data.message || 'Successfully checked in!');
      setSuccessSnackbar(true);
      
      // Navigate to event details after a short delay
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    } catch (err) {
      console.error('Check-in error', err);
      setError(err.response?.data?.message || 'Failed to check in to event');
    } finally {
      setProcessing(false);
    }
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
              {torchEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
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
