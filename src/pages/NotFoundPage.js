// src/pages/NotFoundPage.js

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" gutterBottom>
        The page you are looking for does not exist or you do not have permission to view this page.
      </Typography>
      <Link to="/">
        <Typography variant="h6" color="primary">
          Go to Dashboard
        </Typography>
      </Link>
    </Box>
  );
};

export default NotFoundPage;
