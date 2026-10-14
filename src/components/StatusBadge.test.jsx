// StatusBadge only uses its props (no routing, no API), so a plain render()
// is all it needs.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge.jsx';

describe('StatusBadge', () => {
  it('shows a readable label for the status', () => {
    render(<StatusBadge status="in_progress" />);

    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('shows an unknown status as it is', () => {
    render(<StatusBadge status="on_hold" />);

    expect(screen.getByText('on_hold')).toBeInTheDocument();
  });
});
