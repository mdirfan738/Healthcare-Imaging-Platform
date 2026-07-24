import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusChip from '../components/common/StatusChip';

describe('StatusChip', () => {
  it('renders the given status label', () => {
    render(<StatusChip status="Signed" />);
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('renders an unrecognized status without crashing', () => {
    render(<StatusChip status="SomeUnknownStatus" />);
    expect(screen.getByText('SomeUnknownStatus')).toBeInTheDocument();
  });
});
