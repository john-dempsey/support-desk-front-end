// RefreshNotice only shows a message and a button, so it's rendered on its
// own, with a fake onReload to check the button calls it.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefreshNotice from './RefreshNotice.jsx';

describe('RefreshNotice', () => {
  it('shows its message where screen readers will announce it', () => {
    render(<RefreshNotice message="This ticket has changed." onReload={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('This ticket has changed.');
  });

  it('calls onReload when Reload is clicked', async () => {
    const handleReload = vi.fn();
    render(<RefreshNotice message="This ticket has changed." onReload={handleReload} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(handleReload).toHaveBeenCalled();
  });
});
