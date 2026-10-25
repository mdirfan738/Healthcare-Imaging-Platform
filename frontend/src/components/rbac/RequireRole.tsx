import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

import { useAppSelector } from '../../app/hooks';
import { PermissionKey, hasPermission } from './permissions';

interface RequireRoleProps {
  permission: PermissionKey;
}

const RequireRole: React.FC<RequireRoleProps> = ({ permission }) => {
  const { user } = useAppSelector((state) => state.auth);

  const allowed = hasPermission(user?.role, permission);

  if (!allowed) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            width: '100%',
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Access Denied
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Your current role
            <strong> {user?.role ?? 'Unknown'} </strong>
            does not have permission to access this page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return <Outlet />;
};

export default RequireRole;