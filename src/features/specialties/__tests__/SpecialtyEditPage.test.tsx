import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { apiUrl, httpError, networkError } from '../../../mocks/handlers';
import { makeErrorsHeader } from '../../../mocks/data';
import { renderAt } from './renderSpecialties';

describe('SpecialtyEditPage', () => {
  it('loads the specialty by id when opened directly by URL', async () => {
    renderAt('/specialties/2/edit');
    expect(screen.getByRole('heading', { level: 2, name: 'Edit Specialty' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading specialty...');
    const input = await screen.findByLabelText('Name');
    expect(input).toHaveValue('surgery');
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('submits via PUT and redirects to the list', async () => {
    const puts: { url: string; body: unknown }[] = [];
    server.use(
      http.put(apiUrl('specialties/:id'), async ({ request }) => {
        puts.push({ url: request.url, body: await request.json() });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { router } = renderAt('/specialties/2/edit');
    const input = await screen.findByLabelText('Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'neurology');
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/specialties'));
    expect(puts).toEqual([{ url: apiUrl('specialties/2'), body: { id: 2, name: 'neurology' } }]);
    expect(await screen.findByRole('heading', { level: 2, name: 'Specialties' })).toBeInTheDocument();
  });

  it('Cancel goes back to the list without saving', async () => {
    const { router } = renderAt('/specialties/2/edit');
    await screen.findByLabelText('Name');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(router.state.location.pathname).toBe('/specialties');
  });

  it('shows validation messages only once the field is dirty and disables Update while invalid', async () => {
    renderAt('/specialties/2/edit');
    const input = await screen.findByLabelText('Name');
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

    await userEvent.clear(input);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('Name must begin with a letter or digit')).not.toBeInTheDocument();
    expect(screen.queryByText('Name must be at least 1 characters long')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Name is required');

    await userEvent.type(input, '-bad');
    expect(screen.getByText('Name must begin with a letter or digit')).toBeInTheDocument();
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

    await userEvent.clear(input);
    await userEvent.type(input, 'ok');
    expect(screen.queryByText(/^Name /)).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
  });

  it('caps the name at 80 characters like the Angular maxlength attribute', async () => {
    renderAt('/specialties/2/edit');
    const input = await screen.findByLabelText('Name');
    expect(input).toHaveAttribute('maxlength', '80');
  });

  it('shows the Spring errors header message when the update fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(httpError('put', 'specialties/:id', 400, makeErrorsHeader('name must be unique')));
    const { router } = renderAt('/specialties/2/edit');
    const input = await screen.findByLabelText('Name');
    await userEvent.type(input, '2');
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('name must be unique');
    expect(router.state.location.pathname).toBe('/specialties/2/edit');
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
  });

  it('surfaces a 404 when the specialty does not exist', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/specialties/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to specialties' })).toBeInTheDocument();
  });

  it('surfaces a network error and retries on dismiss', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(networkError('get', 'specialties/:id'));
    renderAt('/specialties/1/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach the server/i);

    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: /dismiss error/i }));
    expect(await screen.findByLabelText('Name')).toHaveValue('radiology');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
