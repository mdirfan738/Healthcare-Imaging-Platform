import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Paper, TextField, Button, Stack, Alert, Divider, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import Can from '../components/rbac/Can';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createReport, updateReport, signReport } from '../features/reports/reportsSlice';

const ReportManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studyId = searchParams.get('studyId') ?? '';
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.reports);

  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [attestationNote, setAttestationNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    setError(null);
    try {
      if (current) {
        await dispatch(updateReport({ id: current.id, findings, impression })).unwrap();
      } else {
        await dispatch(createReport({ studyId, findings, impression })).unwrap();
      }
    } catch {
      setError('Failed to save report. Please try again.');
    }
  };

  const handleSign = async () => {
    if (!current) return;
    setError(null);
    try {
      await dispatch(signReport({ id: current.id, attestationNote })).unwrap();
    } catch {
      setError('Failed to sign report. Signed reports cannot be edited afterward — verify contents first.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Report Management"
        subtitle={studyId ? `Authoring report for study ${studyId}` : 'Select a study from the worklist to begin.'}
        actions={current && <StatusChip status={current.status} />}
      />
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2}>
          <TextField
            label="Findings" fullWidth multiline rows={6} value={findings}
            onChange={(e) => setFindings(e.target.value)}
            disabled={current?.status === 'Signed'}
          />
          <TextField
            label="Impression" fullWidth multiline rows={3} value={impression}
            onChange={(e) => setImpression(e.target.value)}
            disabled={current?.status === 'Signed'}
          />
          <Can permission="REPORT_WRITE">
            <Box>
              <Button variant="outlined" onClick={handleSaveDraft} disabled={current?.status === 'Signed'}>
                Save Draft
              </Button>
            </Box>
          </Can>

          {current?.status !== 'Signed' && (
            <Can permission="REPORT_SIGN">
              <Divider />
              <Typography variant="subtitle2">Sign &amp; Finalize Report</Typography>
              <TextField
                label="Attestation Note" fullWidth value={attestationNote}
                onChange={(e) => setAttestationNote(e.target.value)}
                helperText="Confirms you have reviewed the findings and impression above."
              />
              <Box>
                <Button variant="contained" color="success" onClick={handleSign} disabled={!current}>
                  Sign Report
                </Button>
              </Box>
            </Can>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReportManagementPage;
