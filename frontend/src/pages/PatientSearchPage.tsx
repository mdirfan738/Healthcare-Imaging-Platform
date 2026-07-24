import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
} from '@mui/x-data-grid';

import PageHeader from '../components/common/PageHeader';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { searchPatients } from '../features/patients/patientsSlice';

const columns: GridColDef[] = [
  {
    field: 'patientNumber',
    headerName: 'MRN',
    width: 160,
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    width: 150,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    width: 150,
  },
  {
    field: 'dateOfBirth',
    headerName: 'Date of Birth',
    width: 150,
    valueGetter: (_value, row) =>
      row.dateOfBirth
        ? new Date(row.dateOfBirth).toLocaleDateString()
        : '',
  },
  {
    field: 'gender',
    headerName: 'Gender',
    width: 100,
  },
  {
    field: 'phoneNumber',
    headerName: 'Phone',
    width: 150,
  },
  {
    field: 'insuranceProvider',
    headerName: 'Insurance',
    width: 180,
  },
];

const PatientSearchPage: React.FC = () => {
  const [name, setName] = useState('');
  const [mrn, setMrn] = useState('');

  const dispatch = useAppDispatch();

  const { results, total, status } = useAppSelector(
    (state) => state.patients
  );

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    dispatch(
      searchPatients({
        name: name || undefined,
        patientNumber: mrn || undefined,
        page: 1,
        pageSize: 25,
      })
    );
  };

  return (
    <Box>
      <PageHeader
        title="Patient Search"
        subtitle="Find patients by name or medical record number (MRN)."
      />

      <Paper
        sx={{
          p: 3,
          mb: 3,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSearch}
        >
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Patient Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="MRN"
                fullWidth
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  height: '100%',
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper
        sx={{
          height: 500,
        }}
      >
        <DataGrid
          rows={results}
          columns={columns}
          loading={status === 'loading'}
          rowCount={total}
          paginationMode="server"
          pageSizeOptions={[25]}
        />
      </Paper>
    </Box>
  );
};

export default PatientSearchPage;