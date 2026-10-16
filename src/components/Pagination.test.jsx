// Pagination only uses its props, so a plain render() is enough. A fake
// function (vi.fn()) stands in for onPageChange, so the test can check
// what it was called with.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination.jsx';

describe('Pagination', () => {
  it('shows the current page and the number of pages', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('asks for the next page when Next is clicked', async () => {
    const handlePageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={handlePageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('disables Previous on the first page and Next on the last', () => {
    render(<Pagination page={1} totalPages={2} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('shows nothing when there is only one page', () => {
    render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
