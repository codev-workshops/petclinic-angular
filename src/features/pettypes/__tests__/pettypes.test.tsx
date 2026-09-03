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

describe('PetTypeListPage', () => {
  it('shows a loading indicator and then the pet types', async () => {
    renderAt('/pettypes');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pet Types');
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.queryByText('No pet types found')).not.toBeInTheDocument();

    expect(await screen.findByDisplayValue('cat')).toBeInTheDocument();
    expect(screen.getByDisplayValue('dog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('lizard')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('shows the empty state only once loaded', async () => {
    server.use(http.get(apiUrl('pettypes'), () => HttpResponse.json([])));
    renderAt('/pettypes');
    expect(screen.queryByText('No pet types found')).not.toBeInTheDocument();
    expect(await screen.findByText('No pet types found')).toBeInTheDocument();
  });

  it('surfaces a network error in the alert', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pettypes'));
    renderAt('/pettypes');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('surfaces a 404 in the alert', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'pettypes', 404));
    renderAt('/pettypes');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
  });

  it('navigates to the edit page and to the add page', async () => {
    const user = userEvent.setup();
    const router = renderAt('/pettypes');
    await screen.findByDisplayValue('dog');
    const dogRow = screen.getByDisplayValue('dog').closest('tr') as HTMLTableRowElement;
    await user.click(within(dogRow).getByRole('button', { name: 'Edit' }));
    expect(router.state.location.pathname).toBe('/pettypes/2/edit');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Edit Pet Type');
  });

  it('navigates to add and home', async () => {
    const user = userEvent.setup();
    const router = renderAt('/pettypes');
    await user.click(await screen.findByRole('button', { name: 'Add' }));
    expect(router.state.location.pathname).toBe('/pettypes/add');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('New Pet Type');
  });

  it('deletes a pet type and refetches the list', async () => {
    const user = userEvent.setup();
    let deleted = false;
    server.use(
      http.get(apiUrl('pettypes'), () =>
        HttpResponse.json(deleted ? [{ id: 2, name: 'dog' }] : [{ id: 1, name: 'cat' }, { id: 2, name: 'dog' }]),
      ),
      http.delete(apiUrl('pettypes/1'), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderAt('/pettypes');
    const catRow = (await screen.findByDisplayValue('cat')).closest('tr') as HTMLTableRowElement;
    await user.click(within(catRow).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByDisplayValue('cat')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('dog')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows and dismisses a delete error', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('delete', 'pettypes/1'));
    renderAt('/pettypes');
    const catRow = (await screen.findByDisplayValue('cat')).closest('tr') as HTMLTableRowElement;
    await user.click(within(catRow).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
    await user.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('PetTypeAddPage', () => {
  it('disables Save until the name is valid and shows validation messages', async () => {
    const user = userEvent.setup();
    renderAt('/pettypes/add');
    const save = screen.getByRole('button', { name: 'Save' });
    const input = screen.getByLabelText('Name');
    expect(save).toBeDisabled();
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

    await user.type(input, '-bad');
    expect(screen.getByText('Name must begin with a letter or digit')).toBeInTheDocument();
    expect(save).toBeDisabled();

    await user.clear(input);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('Name must begin with a letter or digit')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', 'name-errors');

    await user.type(input, 'a'.repeat(81));
    expect(screen.getByText('Name may be only 80 characters long')).toBeInTheDocument();
    expect(save).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'hamster');
    expect(screen.queryByText(/Name /)).not.toBeInTheDocument();
    expect(save).toBeEnabled();
  });

  it('posts the new pet type and redirects to the list', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post(apiUrl('pettypes'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: 42, name: 'hamster' }, { status: 201 });
      }),
    );
    const router = renderAt('/pettypes/add');
    await user.type(screen.getByLabelText('Name'), 'hamster');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/pettypes'));
    expect(body).toEqual({ id: null, name: 'hamster' });
    expect(await screen.findByDisplayValue('cat')).toBeInTheDocument();
  });

  it('shows the Spring errors header message on failure', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('post', 'pettypes', 400, makeErrorsHeader('must not be blank')));
    const router = renderAt('/pettypes/add');
    await user.type(screen.getByLabelText('Name'), 'hamster');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('must not be blank');
    expect(router.state.location.pathname).toBe('/pettypes/add');
  });

  it('shows a network error on failure', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('post', 'pettypes'));
    renderAt('/pettypes/add');
    await user.type(screen.getByLabelText('Name'), 'hamster');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });
});

describe('PetTypeEditPage', () => {
  it('loads the pet type by id, puts the change and redirects to the list', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.put(apiUrl('pettypes/2'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = renderAt('/pettypes/2/edit');
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    const input = await screen.findByLabelText('Name');
    expect(input).toHaveValue('dog');
    const update = screen.getByRole('button', { name: 'Update' });
    expect(update).toBeEnabled();

    await user.clear(input);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(update).toBeDisabled();

    await user.type(input, 'puppy');
    await user.click(update);
    await waitFor(() => expect(router.state.location.pathname).toBe('/pettypes'));
    expect(body).toEqual({ id: 2, name: 'puppy' });
  });

  it('Cancel goes back to the list without saving', async () => {
    const user = userEvent.setup();
    const router = renderAt('/pettypes/2/edit');
    await screen.findByLabelText('Name');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(router.state.location.pathname).toBe('/pettypes');
  });

  it('surfaces a 404 when the pet type does not exist', async () => {
    silenceConsoleError();
    renderAt('/pettypes/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 404');
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('surfaces a network error on load', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pettypes/2'));
    renderAt('/pettypes/2/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('surfaces an update failure and stays on the page', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('put', 'pettypes/2', 500));
    const router = renderAt('/pettypes/2/edit');
    const input = await screen.findByLabelText('Name');
    await user.type(input, 'gy');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('server returned code 500');
    expect(router.state.location.pathname).toBe('/pettypes/2/edit');
  });
});
