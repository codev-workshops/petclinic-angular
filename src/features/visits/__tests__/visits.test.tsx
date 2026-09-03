import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { appRoutes } from '../../../router';
import { queryClient } from '../../../services/queryClient';
import { server } from '../../../mocks/server';
import { apiUrl, httpError, networkError } from '../../../mocks/handlers';
import { makeErrorsHeader } from '../../../mocks/data';

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

function silenceConsoleError() {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
}

describe('VisitListPage', () => {
  it('shows a loading indicator and then all visits', async () => {
    renderAt('/visits');
    expect(screen.getByRole('status')).toHaveTextContent('Loading visits...');
    expect(screen.queryByText('No visits found')).not.toBeInTheDocument();
    expect(await screen.findByText('neutered')).toBeInTheDocument();
    expect(screen.getAllByText('rabies shot')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Edit Visit' })[0]).toHaveAttribute('href', '/visits/1/edit');
  });

  it('shows the empty state only once loaded', async () => {
    server.use(http.get(apiUrl('visits'), () => HttpResponse.json([])));
    renderAt('/visits');
    expect(screen.queryByText('No visits found')).not.toBeInTheDocument();
    expect(await screen.findByText('No visits found')).toBeInTheDocument();
  });

  it('surfaces a 404 in the alert', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'visits', 404));
    renderAt('/visits');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
  });
});

describe('VisitAddPage (pets/:id/visits/add)', () => {
  it('prefetches the pet and its owner and lists previous visits when opened directly', async () => {
    renderAt('/pets/8/visits/add');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('New Visit');
    expect(await screen.findByText('Jean Coleman')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('2012-09-04')).toBeInTheDocument();
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('Previous Visits')).toBeInTheDocument();
    expect(screen.getByText('neutered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Visit' })).toBeDisabled();
  });

  it('validates date and description once dirty', async () => {
    const user = userEvent.setup();
    renderAt('/pets/8/visits/add');
    await screen.findByText('Jean Coleman');

    expect(screen.queryByText('Description is required')).not.toBeInTheDocument();
    const description = screen.getByLabelText('Description');
    await user.type(description, 'x');
    await user.clear(description);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    await user.type(description, 'x'.repeat(256));
    expect(screen.getByText('Description may be at most 255 characters long')).toBeInTheDocument();

    const date = screen.getByLabelText('Date');
    await user.type(date, '2024-01-01');
    await user.clear(date);
    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Visit' })).toBeDisabled();
  });

  it('posts to owners/:ownerId/pets/:petId/visits with the pet reference and redirects to the owner', async () => {
    const user = userEvent.setup();
    let posted: Record<string, unknown> | undefined;
    let postedUrl = '';
    server.use(
      http.post(apiUrl('owners/:ownerId/pets/:petId/visits'), async ({ request }) => {
        postedUrl = request.url;
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...posted, id: 77 }, { status: 201 });
      }),
    );
    const router = renderAt('/pets/8/visits/add');
    await screen.findByText('Jean Coleman');

    await user.type(screen.getByLabelText('Date'), '2024-03-15');
    await user.type(screen.getByLabelText('Description'), 'checkup');
    await user.click(screen.getByRole('button', { name: 'Add Visit' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/6'));
    expect(postedUrl).toBe(apiUrl('owners/6/pets/8/visits'));
    expect(posted).toMatchObject({
      id: null,
      date: '2024-03-15',
      description: 'checkup',
      pet: { id: 8, ownerId: 6, name: 'Max' },
    });
  });

  it('surfaces a 404 for an unknown pet', async () => {
    silenceConsoleError();
    renderAt('/pets/999/visits/add');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  });

  it('surfaces a network error when the POST fails', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('post', 'owners/6/pets/8/visits'));
    renderAt('/pets/8/visits/add');
    await screen.findByText('Jean Coleman');
    await user.type(screen.getByLabelText('Date'), '2024-03-15');
    await user.type(screen.getByLabelText('Description'), 'checkup');
    await user.click(screen.getByRole('button', { name: 'Add Visit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('explains that a pet is required on the bare visits/add route', async () => {
    renderAt('/visits/add');
    expect(await screen.findByRole('alert')).toHaveTextContent('Pet id is missing');
  });
});

describe('VisitEditPage', () => {
  it('prefills the visit, pet and owner when opened directly', async () => {
    renderAt('/visits/3/edit');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit Visit');
    expect(await screen.findByDisplayValue('neutered')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toHaveValue('2013-01-03');
    expect(await screen.findByText('Max')).toBeInTheDocument();
    expect(await screen.findByText('Jean Coleman')).toBeInTheDocument();
  });

  it('PUTs the visit with the pet reference and redirects to the owner', async () => {
    const user = userEvent.setup();
    let put: Record<string, unknown> | undefined;
    server.use(
      http.put(apiUrl('visits/3'), async ({ request }) => {
        put = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = renderAt('/visits/3/edit');
    await screen.findByDisplayValue('neutered');
    await screen.findByText('Jean Coleman');
    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'spayed');
    await user.click(screen.getByRole('button', { name: 'Update Visit' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/6'));
    expect(put).toMatchObject({ id: 3, date: '2013-01-03', description: 'spayed', pet: { id: 8, ownerId: 6 } });
  });

  it('surfaces a 404 for an unknown visit', async () => {
    silenceConsoleError();
    renderAt('/visits/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
  });

  it('shows the errors-header message when the PUT fails', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('put', 'visits/3', 400, makeErrorsHeader('description too long', 'description')));
    renderAt('/visits/3/edit');
    await screen.findByDisplayValue('neutered');
    await screen.findByText('Jean Coleman');
    await user.click(screen.getByRole('button', { name: 'Update Visit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('description too long');
  });
});
