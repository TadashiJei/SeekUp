import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Steps for the verification process
const steps = ['Upload Documents', 'Verification Review'];

function Verification() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [idDocument, setIdDocument] = useState(null);
  const [addressDocument, setAddressDocument] = useState(null);
  
  // Handle file change
  const handleFileChange = (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (documentType === 'id') {
      setIdDocument(file);
    } else if (documentType === 'address') {
      setAddressDocument(file);
    }
  };
  
  // Handle document upload
  const handleUploadDocuments = async () => {
    if (!idDocument && !addressDocument) {
      setError('Please upload at least one document for verification');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      if (idDocument) formData.append('idDocument', idDocument);
      if (addressDocument) formData.append('addressDocument', addressDocument);
      
      // Send files to API
      await axios.post('/api/users/verification/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update user verification status locally
      updateUser({
        verificationStatus: 'pending'
      });
      
      setLoading(false);
      setActiveStep(1);
      setSuccess(true);
    } catch (err) {
      console.error('Error uploading verification documents:', err);
      setError('Failed to upload documents. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle going back to profile
  const handleBackToProfile = () => {
    navigate('/profile');
  };
  
  // Render different content based on verification status
  const renderContent = () => {
    // If user is already verified
    if (user?.verificationStatus === 'verified') {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <VerifiedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your Account Is Verified
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for verifying your account. You now have full access to all SeekUp features.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToProfile}
            sx={{ mt: 2 }}
          >
            Back to Profile
          </Button>
        </Box>
      );
    }
    
    // If verification is pending
    if (user?.verificationStatus === 'pending') {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verification In Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your documents are being reviewed. This process typically takes 1-3 business days.
            We'll notify you once your verification is complete.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleBackToProfile}
            sx={{ mt: 2 }}
          >
            Back to Profile
          </Button>
        </Box>
      );
    }
    
    // Default: Initial verification process
    return (
      <>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 ? (
          // Step 1: Upload Documents
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="h6" gutterBottom>
              Upload Verification Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please upload at least one of the following documents to verify your identity.
              All documents will be securely stored and only used for verification purposes.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Identity Document
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Accepted formats: passport, driver's license, or national ID card
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AssignmentIcon />}
                sx={{ mt: 1 }}
                fullWidth
              >
                {idDocument ? idDocument.name : 'Upload ID Document'}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileChange(e, 'id')}
                />
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Proof of Address
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Accepted formats: utility bill, bank statement, or official letter (not older than 3 months)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AssignmentIcon />}
                sx={{ mt: 1 }}
                fullWidth
              >
                {addressDocument ? addressDocument.name : 'Upload Address Document'}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileChange(e, 'address')}
                />
              </Button>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBackToProfile}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUploadDocuments}
                disabled={loading || (!idDocument && !addressDocument)}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Documents'}
              </Button>
            </Box>
          </Box>
        ) : (
          // Step 2: Verification Review
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Documents Submitted Successfully
            </Typography>
            <Typography variant="body1" paragraph>
              Your verification documents have been submitted for review. 
              This process typically takes 1-3 business days.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You'll receive a notification once your verification is complete.
            </Typography>
            <Button
              variant="contained"
              onClick={handleBackToProfile}
              sx={{ mt: 2 }}
            >
              Back to Profile
            </Button>
          </Box>
        )}
      </>
    );
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <VerifiedIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="h1">
            Account Verification
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {renderContent()}
      </Paper>
    </Container>
  );
}

export default Verification;
