import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';

import { useAppSelector } from '../app/hooks';
import PageHeader from '../components/common/PageHeader';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: color,
          color: '#fff',
          borderRadius: 2,
          p: 1.5,
          display: 'flex',
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700 }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.fullName ?? ''}`}
        subtitle="Here's what's happening across the department today."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Today's Appointments"
            value="—"
            icon={<EventIcon />}
            color="#0B5394"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Open Worklist Items"
            value="—"
            icon={<AssignmentIcon />}
            color="#00897B"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Pending Reports"
            value="—"
            icon={<DescriptionIcon />}
            color="#EF6C00"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Patients Registered"
            value="—"
            icon={<GroupIcon />}
            color="#6A1B9A"
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 3,
          mt: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Quick Start
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Use the navigation on the left to register patients,
          schedule appointments, review your worklist,
          author reports, or review audit logs
          (role-permitting). Stat values above are populated
          by wiring this dashboard to the Studies,
          Appointments, and Reports search endpoints
          using today's date filters.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardPage;