import React, { useEffect, useState } from 'react';
import { Box, Paper, TextField, Button, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { searchAuditLogs } from '../features/auditLogs/auditLogsSlice';

const columns: GridColDef[] = [
  { field: 'createdAtUtc', headerName: 'Timestamp', width: 190, valueGetter: (value: string) => new Date(value).toLocaleString() },
  { field: 'username', headerName: 'User', width: 140 },
  { field: 'action', headerName: 'Action', width: 180 },
  { field: 'entityType', headerName: 'Entity', width: 120 },
  { field: 'entityId', headerName: 'Entity ID', width: 260 },
  { field: 'ipAddress', headerName: 'IP Address', width: 140 },
  { field: 'success', headerName: 'Success', width: 100, type: 'boolean' },
];

const AuditLogsPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('');
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((s) => s.auditLogs);

  useEffect(() => {
    dispatch(searchAuditLogs({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(searchAuditLogs({ username: username || undefined, action: action || undefined, page: 1, pageSize: 50 }));
  };

  return (
    <Box>
      <PageHeader title="Audit Logs" subtitle="Immutable trail of all access and changes to PHI-bearing resources." />
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Username" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Action (e.g. PATIENT_CREATE)" fullWidth value={action} onChange={(e) => setAction(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}>Filter</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Paper sx={{ height: 560 }}>
        <DataGrid rows={items} columns={columns} loading={status === 'loading'} rowCount={total} paginationMode="server" />
      </Paper>
    </Box>
  );
};

export default AuditLogsPage;
