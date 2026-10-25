import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Grid, MenuItem, Alert, Snackbar } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createPatient } from '../features/patients/patientsSlice';

const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
  phoneNumber: '', email: '', address: '', nationalId: '', insuranceProvider: '', insuranceNumber: '',
};

const PatientRegistrationPage: React.FC = () => {
  const [form, setForm] = useState(emptyForm);
  const [successOpen, setSuccessOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.patients);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createPatient(form));
    if (createPatient.fulfilled.match(result)) {
      setForm(emptyForm);
      setSuccessOpen(true);
    }
  };

  return (
    <Box>
      <PageHeader title="Patient Registration" subtitle="Register a new patient in the system." />
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="First Name" fullWidth required value={form.firstName} onChange={handleChange('firstName')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Last Name" fullWidth required value={form.lastName} onChange={handleChange('lastName')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Birth" type="date" fullWidth required slotProps={{ inputLabel: { shrink: true } }}
                value={form.dateOfBirth} onChange={handleChange('dateOfBirth')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Gender" fullWidth required value={form.gender} onChange={handleChange('gender')}>
                {GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone Number" fullWidth value={form.phoneNumber} onChange={handleChange('phoneNumber')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Address" fullWidth value={form.address} onChange={handleChange('address')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="National ID" fullWidth value={form.nationalId} onChange={handleChange('nationalId')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Insurance Provider" fullWidth value={form.insuranceProvider} onChange={handleChange('insuranceProvider')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Insurance Number" fullWidth value={form.insuranceNumber} onChange={handleChange('insuranceNumber')} />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={status === 'loading'}>
            Register Patient
          </Button>
        </Box>
      </Paper>
      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>Patient registered successfully.</Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientRegistrationPage;
