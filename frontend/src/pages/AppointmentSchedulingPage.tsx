import React, { useEffect, useState } from 'react';
import { Box, Paper, TextField, Button, Grid, MenuItem, List, ListItem, ListItemText, Divider } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createAppointment, fetchAppointments } from '../features/appointments/appointmentsSlice';
import { Modality } from '../types';

const MODALITIES: Modality[] = ['CR', 'CT', 'MR', 'US', 'XA', 'NM', 'PT', 'DX', 'MG', 'RF', 'OT'];

const AppointmentSchedulingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.appointments);
  const [form, setForm] = useState({ patientId: '', scheduledAtUtc: '', modalityRequested: 'CT' as Modality, reason: '' });

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);
    dispatch(fetchAppointments({ fromUtc: from.toISOString(), toUtc: to.toISOString() }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createAppointment(form));
    setForm({ patientId: '', scheduledAtUtc: '', modalityRequested: 'CT', reason: '' });
  };

  return (
    <Box>
      <PageHeader title="Appointment Scheduling" subtitle="Schedule and review upcoming imaging appointments." />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Patient ID" fullWidth required margin="normal"
                helperText="Paste the patient's system ID from search results"
                value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              />
              <TextField
                label="Scheduled Date/Time" type="datetime-local" fullWidth required margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.scheduledAtUtc} onChange={(e) => setForm({ ...form, scheduledAtUtc: e.target.value })}
              />
              <TextField
                select label="Modality" fullWidth required margin="normal"
                value={form.modalityRequested} onChange={(e) => setForm({ ...form, modalityRequested: e.target.value as Modality })}
              >
                {MODALITIES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
              <TextField
                label="Reason" fullWidth required margin="normal" multiline rows={3}
                value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>Schedule Appointment</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2 }}>
            <List>
              {items.map((a, idx) => (
                <React.Fragment key={a.id}>
                  <ListItem
                    secondaryAction={<StatusChip status={a.status} />}
                  >
                    <ListItemText
                      primary={`${a.patientName} — ${a.modalityRequested}`}
                      secondary={`${new Date(a.scheduledAtUtc).toLocaleString()} • ${a.reason}`}
                    />
                  </ListItem>
                  {idx < items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {items.length === 0 && <ListItem><ListItemText primary="No appointments in the next 7 days." /></ListItem>}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppointmentSchedulingPage;
