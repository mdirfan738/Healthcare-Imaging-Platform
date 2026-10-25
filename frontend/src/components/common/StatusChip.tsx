import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  status: string;
}

const COLOR_MAP: Record<string, ChipProps['color']> = {
  Scheduled: 'info',
  InProgress: 'warning',
  Completed: 'success',
  Cancelled: 'default',
  Verified: 'success',
  CheckedIn: 'info',
  NoShow: 'error',
  Draft: 'default',
  Preliminary: 'warning',
  Finalized: 'success',
  Signed: 'success',
  Amended: 'warning',
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  return (
    <Chip
      label={status}
      color={COLOR_MAP[status] ?? 'default'}
      variant="filled"
      size="small"
      sx={{
        fontWeight: 600,
        minWidth: 90,
      }}
    />
  );
};

export default StatusChip;