import React, { useState } from 'react';
import { Box, Typography, Button, MobileStepper, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const onboardingSteps = [
  {
    title: 'Welcome to SEEKUP',
    description: 'Your platform for finding and participating in meaningful volunteer opportunities.',
  },
  {
    title: 'Find Events',
    description: 'Browse and search for volunteer events that match your interests and availability.',
  },
  {
    title: 'Track Impact',
    description: 'Keep track of your volunteer hours and see the difference you make in your community.',
  },
  {
    title: 'Get Started',
    description: 'Join our community of volunteers and start making a difference today!',
  },
];

const Onboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const maxSteps = onboardingSteps.length;

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      navigate('/register');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        square
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {onboardingSteps[activeStep].title}
        </Typography>
        <Typography color="textSecondary" paragraph>
          {onboardingSteps[activeStep].description}
        </Typography>
      </Paper>

      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{ bgcolor: 'background.paper' }}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            sx={{ mr: 1 }}
          >
            {activeStep === maxSteps - 1 ? 'Get Started' : 'Next'}
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ ml: 1 }}
          >
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </Box>
  );
};

export default Onboarding;
