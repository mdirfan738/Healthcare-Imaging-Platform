import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingOverlay: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
    <CircularProgress />
  </Box>
);

export default LoadingOverlay;
