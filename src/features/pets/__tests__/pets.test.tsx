import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { appRoutes } from '@/router';
import { queryClient } from '@/services/queryClient';
import { server } from '@/mocks/server';
import { apiUrl, httpError, networkError } from '@/mocks/handlers';
import { makeErrorsHeader } from '@/mocks/data';

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

describe('PetListPage', () => {
  it('shows a loading indicator and then all pets', async () => {
    renderAt('/pets');
    expect(screen.getByRole('status')).toHaveTextContent('Loading pets...');
    expect(screen.queryByText('No pets found')).not.toBeInTheDocument();
    expect(await screen.findByText('Leo')).toBeInTheDocument();
    expect(screen.getByText('Samantha')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('shows the empty state only once loaded', async () => {
    server.use(http.get(apiUrl('pets'), () => HttpResponse.json([])));
    renderAt('/pets');
    expect(screen.queryByText('No pets found')).not.toBeInTheDocument();
    expect(await screen.findByText('No pets found')).toBeInTheDocument();
  });

  it('surfaces a network error', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pets'));
    renderAt('/pets');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
    expect(screen.queryByText('No pets found')).not.toBeInTheDocument();
  });
});

describe('PetAddPage (owners/:id/pets/add)', () => {
  it('prefetches the owner and pet types when opened directly', async () => {
    renderAt('/owners/6/pets/add');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Add Pet');
    expect(await screen.findByDisplayValue('Jean Coleman')).toHaveAttribute('readonly');
    const select = screen.getByLabelText('Type');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'cat' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'dog' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'lizard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Pet' })).toBeDisabled();
  });

  it('validates name, birth date and type once dirty', async () => {
    const user = userEvent.setup();
    renderAt('/owners/6/pets/add');
    await screen.findByDisplayValue('Jean Coleman');

    const name = screen.getByLabelText('Name');
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    await user.type(name, '-bad');
    expect(screen.getByText('Name must begin with a letter')).toBeInTheDocument();
    await user.clear(name);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('Name must begin with a letter')).not.toBeInTheDocument();
    await user.type(name, 'a'.repeat(31));
    expect(screen.getByText('Name may be at most 30 character long')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Type'), 'dog');
    await user.selectOptions(screen.getByLabelText('Type'), '');
    expect(screen.getByText('pettype is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Pet' })).toBeDisabled();
  });

  it('posts to owners/:ownerId/pets with the owner reference and redirects to the owner', async () => {
    const user = userEvent.setup();
    let posted: Record<string, unknown> | undefined;
    let postedUrl = '';
    server.use(
      http.post(apiUrl('owners/:ownerId/pets'), async ({ request }) => {
        postedUrl = request.url;
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...posted, id: 99 }, { status: 201 });
      }),
    );
    const router = renderAt('/owners/6/pets/add');
    await screen.findByDisplayValue('Jean Coleman');

    await user.type(screen.getByLabelText('Name'), 'Rex');
    await user.type(screen.getByLabelText('Birth Date'), '2020-05-17');
    await user.selectOptions(screen.getByLabelText('Type'), 'dog');
    await user.click(screen.getByRole('button', { name: 'Save Pet' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/6'));
    expect(postedUrl).toBe(apiUrl('owners/6/pets'));
    expect(posted).toMatchObject({
      id: null,
      name: 'Rex',
      birthDate: '2020-05-17',
      type: { id: 2, name: 'dog' },
      owner: { id: 6, lastName: 'Coleman' },
    });
    expect(await screen.findByText('Owner Information')).toBeInTheDocument();
  });

  it('surfaces a 404 when the owner does not exist', async () => {
    silenceConsoleError();
    renderAt('/owners/999/pets/add');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('surfaces a pet types network error', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pettypes'));
    renderAt('/owners/6/pets/add');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('shows the errors-header message when the POST fails', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('post', 'owners/6/pets', 400, makeErrorsHeader('name must not be blank')));
    renderAt('/owners/6/pets/add');
    await screen.findByDisplayValue('Jean Coleman');
    await user.type(screen.getByLabelText('Name'), 'Rex');
    await user.type(screen.getByLabelText('Birth Date'), '2020-05-17');
    await user.selectOptions(screen.getByLabelText('Type'), 'dog');
    await user.click(screen.getByRole('button', { name: 'Save Pet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('name must not be blank');
  });

  it('explains that an owner is required on the bare pets/add route', async () => {
    renderAt('/pets/add');
    expect(await screen.findByRole('alert')).toHaveTextContent('Owner id is missing');
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });
});

describe('PetEditPage', () => {
  it('prefills pet, owner and preselects the current type when opened directly', async () => {
    renderAt('/pets/8/edit');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pet');
    expect(await screen.findByDisplayValue('Max')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jean Coleman')).toBeInTheDocument();
    expect(screen.getByLabelText('Birth Date')).toHaveValue('2012-09-04');
    expect(screen.getByLabelText('Type')).toHaveValue('2');
    expect(screen.getByRole('option', { name: 'dog', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Pet' })).toBeEnabled();
  });

  it('PUTs the pet with the selected type and redirects to the owner', async () => {
    const user = userEvent.setup();
    let put: Record<string, unknown> | undefined;
    server.use(
      http.put(apiUrl('pets/8'), async ({ request }) => {
        put = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = renderAt('/pets/8/edit');
    await screen.findByDisplayValue('Max');
    await user.selectOptions(screen.getByLabelText('Type'), 'lizard');
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Maxi');
    await user.click(screen.getByRole('button', { name: 'Update Pet' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/6'));
    expect(put).toMatchObject({ id: 8, name: 'Maxi', birthDate: '2012-09-04', type: { id: 3, name: 'lizard' } });
  });

  it('surfaces a 404 for an unknown pet', async () => {
    silenceConsoleError();
    renderAt('/pets/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('surfaces a network error on update', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('put', 'pets/8'));
    renderAt('/pets/8/edit');
    await screen.findByDisplayValue('Max');
    await user.click(screen.getByRole('button', { name: 'Update Pet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });
});
