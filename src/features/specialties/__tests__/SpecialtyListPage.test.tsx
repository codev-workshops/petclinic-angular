import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { apiUrl, httpError, networkError } from '../../../mocks/handlers';
import { makeErrorsHeader, makeSpecialties } from '../../../mocks/data';
import { renderAt } from './renderSpecialties';

describe('SpecialtyListPage', () => {
  it('shows a loading indicator, then the specialties from the API', async () => {
    renderAt('/specialties');
    expect(screen.getByRole('heading', { level: 2, name: 'Specialties' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading specialties...');
    expect(screen.queryByText('No specialties found')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();

    expect(await screen.findByDisplayValue('radiology')).toBeInTheDocument();
    expect(screen.getByDisplayValue('surgery')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('dentistry')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('shows the empty state only after loading finished', async () => {
    server.use(http.get(apiUrl('specialties'), () => HttpResponse.json([])));
    renderAt('/specialties');
    expect(screen.queryByText('No specialties found')).not.toBeInTheDocument();
    expect(await screen.findByText('No specialties found')).toBeInTheDocument();
  });

  it('surfaces a Spring errors header message in a dismissable alert', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(httpError('get', 'specialties', 500, makeErrorsHeader('boom from server')));
    renderAt('/specialties');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('boom from server');
    expect(screen.queryByText('No specialties found')).not.toBeInTheDocument();
    // Angular's finalize() still reveals the footer buttons on error.
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    server.resetHandlers();
    await userEvent.click(within(alert).getByRole('button', { name: /dismiss error/i }));
    expect(await screen.findByDisplayValue('radiology')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces a 404 and a network error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(httpError('get', 'specialties', 404));
    const first = renderAt('/specialties');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
    first.unmount();

    server.use(networkError('get', 'specialties'));
    renderAt('/specialties');
    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach the server/i);
  });

  it('navigates to the edit route and to home', async () => {
    const { router } = renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    expect(router.state.location.pathname).toBe('/specialties/2/edit');
    expect(await screen.findByRole('heading', { level: 2, name: 'Edit Specialty' })).toBeInTheDocument();
  });

  it('goes home from the Home button', async () => {
    const { router } = renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    await userEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(router.state.location.pathname).toBe('/welcome');
  });

  it('deletes a specialty and refetches the list', async () => {
    const remaining = makeSpecialties();
    const deleted: string[] = [];
    server.use(
      http.get(apiUrl('specialties'), () => HttpResponse.json(remaining)),
      http.delete(apiUrl('specialties/:id'), ({ params }) => {
        deleted.push(String(params.id));
        const index = remaining.findIndex((item) => String(item.id) === params.id);
        remaining.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByDisplayValue('radiology')).not.toBeInTheDocument());
    expect(deleted).toEqual(['1']);
    expect(screen.getByDisplayValue('surgery')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error when the delete fails and keeps the list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(httpError('delete', 'specialties/:id', 404));
    renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
    expect(screen.getByDisplayValue('radiology')).toBeInTheDocument();
  });

  it('toggles the inline add form, saves via POST and hides the form again', async () => {
    const posted: unknown[] = [];
    const list = makeSpecialties();
    server.use(
      http.get(apiUrl('specialties'), () => HttpResponse.json(list)),
      http.post(apiUrl('specialties'), async ({ request }) => {
        const body = (await request.json()) as { name: string };
        posted.push(body);
        const created = { id: 42, name: body.name };
        list.push(created);
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    expect(screen.queryByRole('heading', { name: 'New Specialty' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('heading', { level: 2, name: 'New Specialty' })).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Name'), 'cardiology');
    expect(save).toBeEnabled();
    await userEvent.click(save);

    expect(await screen.findByDisplayValue('cardiology')).toBeInTheDocument();
    expect(posted).toEqual([{ name: 'cardiology' }]);
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'New Specialty' })).not.toBeInTheDocument());
  });

  it('surfaces add errors inside the inline form', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(httpError('post', 'specialties', 400, makeErrorsHeader('name already exists')));
    renderAt('/specialties');
    await screen.findByDisplayValue('radiology');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await userEvent.type(screen.getByLabelText('Name'), 'radiology');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('name already exists');
    expect(screen.getByRole('heading', { name: 'New Specialty' })).toBeInTheDocument();
  });
});
