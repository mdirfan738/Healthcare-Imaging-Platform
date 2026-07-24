import React, { useEffect } from 'react';
import { Box, Paper, Button } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchWorklist } from '../features/worklist/worklistSlice';

const WorklistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, total, status } = useAppSelector(
    (state) => state.worklist
  );

  const { user } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      dispatch(
        fetchWorklist({
          radiologistId: user.username,
          page: 1,
          pageSize: 25,
        })
      );
    }
  }, [dispatch, user]);

  const columns: GridColDef[] = [
    {
      field: 'accessionNumber',
      headerName: 'Accession #',
      width: 150,
    },
    {
      field: 'patientName',
      headerName: 'Patient',
      width: 180,
    },
    {
      field: 'modality',
      headerName: 'Modality',
      width: 100,
    },
    {
      field: 'studyDescription',
      headerName: 'Description',
      width: 220,
    },
    {
      field: 'scheduledDateUtc',
      headerName: 'Scheduled',
      width: 180,
      valueGetter: (value) =>
        value ? new Date(value as string).toLocaleString() : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <StatusChip status={String(params.value)} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            navigate(`/reports/new?studyId=${params.row.id}`)
          }
        >
          Write Report
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Radiologist Worklist"
        subtitle="Studies assigned to you awaiting review and reporting."
      />

      <Paper sx={{ height: 560 }}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={status === 'loading'}
          rowCount={total}
          paginationMode="server"
          pageSizeOptions={[25]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default WorklistPage;