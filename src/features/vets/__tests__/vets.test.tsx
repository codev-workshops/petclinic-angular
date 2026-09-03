import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { appRoutes } from '../../../router';
import { queryClient } from '../../../services/queryClient';
import { server } from '../../../mocks/server';
import { apiUrl, httpError, networkError } from '../../../mocks/handlers';
import { makeErrorsHeader, makeSpecialties, makeVets } from '../../../mocks/data';

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

function rowOf(text: string): HTMLTableRowElement {
  return screen.getByText(text).closest('tr') as HTMLTableRowElement;
}

describe('VetListPage', () => {
  it('shows a loading indicator and then the vets with their specialties', async () => {
    renderAt('/vets');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Veterinarians');
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.queryByText('No veterinarians found')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Vet' })).not.toBeInTheDocument();

    expect(await screen.findByText('James Carter')).toBeInTheDocument();
    expect(within(rowOf('Helen Leary')).getByText('radiology')).toBeInTheDocument();
    const linda = rowOf('Linda Douglas');
    expect(within(linda).getByText('surgery')).toBeInTheDocument();
    expect(within(linda).getByText('dentistry')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit Vet' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Delete Vet' })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Vet' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Specialties' })).toBeInTheDocument();
  });

  it('shows the empty state only once loaded', async () => {
    server.use(http.get(apiUrl('vets'), () => HttpResponse.json([])));
    renderAt('/vets');
    expect(screen.queryByText('No veterinarians found')).not.toBeInTheDocument();
    expect(await screen.findByText('No veterinarians found')).toBeInTheDocument();
  });

  it('surfaces a network error in the alert', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'vets'));
    renderAt('/vets');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
    expect(screen.queryByText('No veterinarians found')).not.toBeInTheDocument();
  });

  it('surfaces a 404 in the alert', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'vets', 404));
    renderAt('/vets');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
  });

  it('navigates to edit, add and home', async () => {
    const user = userEvent.setup();
    const router = renderAt('/vets');
    await screen.findByText('Helen Leary');
    await user.click(within(rowOf('Helen Leary')).getByRole('button', { name: 'Edit Vet' }));
    expect(router.state.location.pathname).toBe('/vets/2/edit');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Edit Veterinarian');

    await user.click(screen.getByRole('button', { name: '< Back' }));
    await user.click(await screen.findByRole('button', { name: 'Add Vet' }));
    expect(router.state.location.pathname).toBe('/vets/add');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('New Veterinarian');

    await user.click(screen.getByRole('button', { name: '< Back' }));
    await user.click(await screen.findByRole('button', { name: 'Home' }));
    expect(router.state.location.pathname).toBe('/welcome');
  });

  it('deletes a vet and refetches the list', async () => {
    const user = userEvent.setup();
    let deleted = false;
    server.use(
      http.get(apiUrl('vets'), () => HttpResponse.json(deleted ? makeVets().slice(1) : makeVets())),
      http.delete(apiUrl('vets/1'), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderAt('/vets');
    await screen.findByText('James Carter');
    await user.click(within(rowOf('James Carter')).getByRole('button', { name: 'Delete Vet' }));
    await waitFor(() => expect(screen.queryByText('James Carter')).not.toBeInTheDocument());
    expect(screen.getByText('Helen Leary')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows and dismisses a delete error', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('delete', 'vets/1'));
    renderAt('/vets');
    await screen.findByText('James Carter');
    await user.click(within(rowOf('James Carter')).getByRole('button', { name: 'Delete Vet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
    await user.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('VetAddPage', () => {
  it('lists the specialties in the multi-select', async () => {
    renderAt('/vets/add');
    const select = (await screen.findByLabelText('Type')) as HTMLSelectElement;
    expect(select.multiple).toBe(true);
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'radiology',
      'surgery',
      'dentistry',
    ]);
  });

  it('disables Save until both names are valid and shows validation messages', async () => {
    const user = userEvent.setup();
    renderAt('/vets/add');
    const save = await screen.findByRole('button', { name: 'Save Vet' });
    const firstName = screen.getByLabelText('First Name');
    const lastName = screen.getByLabelText('Last Name');
    expect(save).toBeDisabled();
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument();

    await user.type(firstName, 'J1');
    expect(screen.getByText('First Name may only consist of letters')).toBeInTheDocument();
    await user.clear(firstName);
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.queryByText('First Name may only consist of letters')).not.toBeInTheDocument();
    expect(firstName).toHaveAttribute('aria-describedby', 'firstName-errors');
    expect(firstName).toHaveAttribute('aria-invalid', 'true');

    await user.type(firstName, 'a'.repeat(31));
    expect(screen.getByText('First Name may be only 30 characters long')).toBeInTheDocument();
    await user.clear(firstName);
    await user.type(firstName, 'James');
    expect(save).toBeDisabled();

    await user.type(lastName, 'Carter Jr');
    expect(screen.getByText('Last Name may only consist of letters')).toBeInTheDocument();
    expect(save).toBeDisabled();
    await user.clear(lastName);
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    await user.type(lastName, 'Carter');
    expect(save).toBeEnabled();
  });

  it('posts the new vet with the selected specialties and redirects to the list', async () => {
    const user = userEvent.setup();
    let posted: unknown = null;
    server.use(
      http.post(apiUrl('vets'), async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({ ...(posted as object), id: 42 }, { status: 201 });
      }),
    );
    const router = renderAt('/vets/add');
    await user.type(await screen.findByLabelText('First Name'), 'Rafael');
    await user.type(screen.getByLabelText('Last Name'), 'Ortega');
    await user.selectOptions(screen.getByLabelText('Type'), ['radiology', 'dentistry']);
    await user.click(screen.getByRole('button', { name: 'Save Vet' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/vets'));
    const [radiology, , dentistry] = makeSpecialties();
    expect(posted).toEqual({ id: null, firstName: 'Rafael', lastName: 'Ortega', specialties: [radiology, dentistry] });
    expect(await screen.findByText('James Carter')).toBeInTheDocument();
  });

  it('shows the Spring errors header message on failure and stays on the page', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('post', 'vets', 400, makeErrorsHeader('must not be blank', 'firstName')));
    const router = renderAt('/vets/add');
    await user.type(await screen.findByLabelText('First Name'), 'Rafael');
    await user.type(screen.getByLabelText('Last Name'), 'Ortega');
    await user.click(screen.getByRole('button', { name: 'Save Vet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('must not be blank');
    expect(router.state.location.pathname).toBe('/vets/add');
  });

  it('shows a network error on failure', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('post', 'vets'));
    renderAt('/vets/add');
    await user.type(await screen.findByLabelText('First Name'), 'Rafael');
    await user.type(screen.getByLabelText('Last Name'), 'Ortega');
    await user.click(screen.getByRole('button', { name: 'Save Vet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('surfaces a failure to load the specialties', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'specialties', 404));
    renderAt('/vets/add');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
  });

  it('Back goes to the list', async () => {
    const user = userEvent.setup();
    const router = renderAt('/vets/add');
    await user.click(await screen.findByRole('button', { name: '< Back' }));
    expect(router.state.location.pathname).toBe('/vets');
  });
});

describe('VetEditPage', () => {
  it('preloads the vet and the specialties via the route loader (no intermediate loading state)', async () => {
    renderAt('/vets/3/edit');
    // Nothing renders until the loader has resolved both requests, like the Angular resolvers.
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();

    await screen.findByRole('heading', { level: 2, name: 'Edit Veterinarian' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('Linda');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Douglas');
    const select = screen.getByLabelText('Specialties') as HTMLSelectElement;
    expect(select.multiple).toBe(true);
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'radiology',
      'surgery',
      'dentistry',
    ]);
    expect(Array.from(select.selectedOptions, (option) => option.textContent)).toEqual(['surgery', 'dentistry']);
    expect(queryClient.getQueryData(['vets', 'detail', '3'])).toBeDefined();
    expect(queryClient.getQueryData(['specialties', 'list'])).toBeDefined();
  });

  it('puts the change (with updated specialties) and redirects to the list', async () => {
    const user = userEvent.setup();
    let put: unknown = null;
    server.use(
      http.put(apiUrl('vets/2'), async ({ request }) => {
        put = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = renderAt('/vets/2/edit');
    const firstName = await screen.findByLabelText('First Name');
    expect(firstName).toHaveValue('Helen');
    await user.clear(firstName);
    await user.type(firstName, 'Helena');
    const select = screen.getByLabelText('Specialties');
    await user.deselectOptions(select, 'radiology');
    await user.selectOptions(select, 'surgery');
    await user.click(screen.getByRole('button', { name: 'Save Vet' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/vets'));
    expect(put).toEqual({ id: 2, firstName: 'Helena', lastName: 'Leary', specialties: [makeSpecialties()[1]] });
  });

  it('disables Save while invalid and shows the edit-template messages', async () => {
    const user = userEvent.setup();
    renderAt('/vets/2/edit');
    const lastName = await screen.findByLabelText('Last Name');
    const save = screen.getByRole('button', { name: 'Save Vet' });
    expect(save).toBeEnabled();
    await user.clear(lastName);
    expect(screen.getByText('Last Name is required')).toBeInTheDocument();
    expect(save).toBeDisabled();
    await user.type(lastName, 'Le4ry');
    expect(screen.getByText('Last Name may only consist of letters')).toBeInTheDocument();
    expect(save).toBeDisabled();
  });

  it('Back goes to the list without saving', async () => {
    const user = userEvent.setup();
    const router = renderAt('/vets/2/edit');
    await user.click(await screen.findByRole('button', { name: '< Back' }));
    expect(router.state.location.pathname).toBe('/vets');
  });

  it('surfaces a 404 when the vet does not exist', async () => {
    silenceConsoleError();
    renderAt('/vets/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '< Back' })).toBeInTheDocument();
  });

  it('surfaces a network error on load', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'specialties'));
    renderAt('/vets/2/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('surfaces an update failure and stays on the page', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('put', 'vets/2', 400, makeErrorsHeader('size must be between 1 and 30', 'lastName')));
    const router = renderAt('/vets/2/edit');
    await screen.findByLabelText('First Name');
    await user.click(screen.getByRole('button', { name: 'Save Vet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('size must be between 1 and 30');
    expect(router.state.location.pathname).toBe('/vets/2/edit');
    await user.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
