import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorAlert from '@/components/ErrorAlert';

describe('ErrorAlert', () => {
  it('renders nothing without a message', () => {
    const { container } = render(<ErrorAlert message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the message and calls onDismiss', async () => {
    const onDismiss = vi.fn();
    render(<ErrorAlert message="Something failed" onDismiss={onDismiss} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
    await userEvent.click(screen.getByRole('button', { name: /dismiss error/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
