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
import { makeErrorsHeader, makeOwners } from '../../../mocks/data';

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

describe('OwnerListPage', () => {
  it('shows a loading indicator and then all owners with links to detail', async () => {
    renderAt('/owners');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Owners');
    expect(screen.getByRole('status')).toHaveTextContent('Loading owners...');
    expect(screen.queryByText(/No owners with LastName/)).not.toBeInTheDocument();

    expect(await screen.findByRole('link', { name: 'George Franklin' })).toHaveAttribute('href', '/owners/1');
    expect(screen.getByRole('link', { name: 'Jean Coleman' })).toHaveAttribute('href', '/owners/6');
    expect(screen.getByText('Madison')).toBeInTheDocument();
    expect(screen.getByText('6085551023')).toBeInTheDocument();
    expect(screen.getByText('Samantha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Owner' })).toBeInTheDocument();
  });

  it('searches by last name via ?lastName= and shows "not found" when empty', async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    server.use(
      http.get(apiUrl('owners'), ({ request }) => {
        const lastName = new URL(request.url).searchParams.get('lastName') ?? '';
        seen.push(lastName);
        return HttpResponse.json(makeOwners().filter((o) => o.lastName.startsWith(lastName)));
      }),
    );
    renderAt('/owners');
    await screen.findByRole('link', { name: 'George Franklin' });

    await user.type(screen.getByLabelText('Last name'), 'Dav');
    await user.click(screen.getByRole('button', { name: 'Find Owner' }));
    expect(await screen.findByRole('link', { name: 'Betty Davis' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'George Franklin' })).not.toBeInTheDocument();
    expect(seen).toContain('Dav');

    await user.clear(screen.getByLabelText('Last name'));
    await user.type(screen.getByLabelText('Last name'), 'Zzz');
    await user.click(screen.getByRole('button', { name: 'Find Owner' }));
    expect(await screen.findByText('No owners with LastName starting with "Zzz"')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Owner' })).toBeInTheDocument();
  });

  it('navigates to the add page from the Add Owner button', async () => {
    const user = userEvent.setup();
    const router = renderAt('/owners');
    await user.click(await screen.findByRole('button', { name: 'Add Owner' }));
    expect(router.state.location.pathname).toBe('/owners/add');
  });

  it('surfaces a network error in the alert', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'owners'));
    renderAt('/owners');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });

  it('surfaces a 404 in the alert', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'owners', 404));
    renderAt('/owners');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
  });
});

describe('OwnerDetailPage', () => {
  it('renders owner info, pets and visits with edit/add links', async () => {
    renderAt('/owners/6');
    expect(await screen.findByText('Jean Coleman')).toBeInTheDocument();
    expect(screen.getByText('105 N. Lake St.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Owner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add New Pet' })).toBeInTheDocument();

    const samantha = screen.getByTestId('pet-7');
    expect(within(samantha).getByText('Samantha')).toBeInTheDocument();
    expect(within(samantha).getByText('2012-09-04')).toBeInTheDocument();
    expect(within(samantha).getByText('cat')).toBeInTheDocument();
    expect(within(samantha).getByRole('button', { name: 'Edit Pet' })).toBeInTheDocument();
    expect(within(samantha).getByRole('button', { name: 'Add Visit' })).toBeInTheDocument();
    expect(within(samantha).getByText('rabies shot')).toBeInTheDocument();
    expect(within(samantha).getByText('2013-01-01')).toBeInTheDocument();
    expect(within(samantha).getByRole('button', { name: 'Edit Visit' })).toBeInTheDocument();

    const max = screen.getByTestId('pet-8');
    expect(within(max).getByText('neutered')).toBeInTheDocument();
    expect(within(max).getAllByRole('button', { name: 'Delete Visit' })).toHaveLength(2);
  });

  it('navigates to edit owner, add pet, edit pet, add visit and edit visit', async () => {
    const user = userEvent.setup();
    const router = renderAt('/owners/6');
    await screen.findByText('Jean Coleman');

    await user.click(screen.getByRole('button', { name: 'Edit Owner' }));
    expect(router.state.location.pathname).toBe('/owners/6/edit');
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    await screen.findByText('Owner Information');

    await user.click(screen.getByRole('button', { name: 'Add New Pet' }));
    expect(router.state.location.pathname).toBe('/owners/6/pets/add');
    await user.click(await screen.findByRole('button', { name: '< Back' }));
    await screen.findByText('Owner Information');

    await user.click(within(screen.getByTestId('pet-7')).getByRole('button', { name: 'Edit Pet' }));
    expect(router.state.location.pathname).toBe('/pets/7/edit');
    await user.click(await screen.findByRole('button', { name: '< Back' }));
    await screen.findByText('Owner Information');

    await user.click(within(screen.getByTestId('pet-7')).getByRole('button', { name: 'Add Visit' }));
    expect(router.state.location.pathname).toBe('/pets/7/visits/add');
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    await screen.findByText('Owner Information');

    await user.click(within(screen.getByTestId('pet-7')).getByRole('button', { name: 'Edit Visit' }));
    expect(router.state.location.pathname).toBe('/visits/1/edit');
  });

  it('deletes a pet and refetches the owner (204 empty body)', async () => {
    const user = userEvent.setup();
    let deleted = false;
    server.use(
      http.delete(apiUrl('pets/7'), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(apiUrl('owners/6'), () => {
        const owner = makeOwners()[2];
        return HttpResponse.json(deleted ? { ...owner, pets: owner.pets.filter((p) => p.id !== 7) } : owner);
      }),
    );
    renderAt('/owners/6');
    await screen.findByText('Samantha');
    await user.click(within(screen.getByTestId('pet-7')).getByRole('button', { name: 'Delete Pet' }));
    await waitFor(() => expect(screen.queryByText('Samantha')).not.toBeInTheDocument());
    expect(deleted).toBe(true);
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('deletes a visit and refetches the owner', async () => {
    const user = userEvent.setup();
    let deleted = false;
    server.use(
      http.delete(apiUrl('visits/3'), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(apiUrl('owners/6'), () => {
        const owner = makeOwners()[2];
        if (!deleted) {
          return HttpResponse.json(owner);
        }
        return HttpResponse.json({
          ...owner,
          pets: owner.pets.map((p) => ({ ...p, visits: p.visits.filter((v) => v.id !== 3) })),
        });
      }),
    );
    renderAt('/owners/6');
    await screen.findByText('neutered');
    const neuteredRow = screen.getByText('neutered').closest('tr') as HTMLElement;
    await user.click(within(neuteredRow).getByRole('button', { name: 'Delete Visit' }));
    await waitFor(() => expect(screen.queryByText('neutered')).not.toBeInTheDocument());
    expect(deleted).toBe(true);
  });

  it('shows the delete error in an alert when deleting a pet fails', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('delete', 'pets/7', 500, makeErrorsHeader('Pet still has visits')));
    renderAt('/owners/6');
    await screen.findByText('Samantha');
    await user.click(within(screen.getByTestId('pet-7')).getByRole('button', { name: 'Delete Pet' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Pet still has visits');
    expect(screen.getByText('Samantha')).toBeInTheDocument();
  });

  it('deletes the owner and returns to the list', async () => {
    const user = userEvent.setup();
    const router = renderAt('/owners/2');
    await screen.findByText('Betty Davis');
    await user.click(screen.getByRole('button', { name: 'Delete Owner' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/owners'));
  });

  it('surfaces a 404 for an unknown owner', async () => {
    silenceConsoleError();
    renderAt('/owners/999');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
    expect(screen.queryByText('Pets and Visits')).not.toBeInTheDocument();
  });

  it('surfaces a network error', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'owners/6'));
    renderAt('/owners/6');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });
});

describe('OwnerAddPage', () => {
  it('validates fields once dirty with the Angular messages', async () => {
    const user = userEvent.setup();
    renderAt('/owners/add');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('New Owner');
    const submit = screen.getByRole('button', { name: 'Add Owner' });
    expect(submit).toBeDisabled();
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument();

    const firstName = screen.getByLabelText('First Name');
    await user.type(firstName, 'A1');
    expect(screen.getByText('First name must consist of letters only')).toBeInTheDocument();
    await user.clear(firstName);
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.queryByText('First name must consist of letters only')).not.toBeInTheDocument();
    await user.type(firstName, 'A'.repeat(31));
    expect(screen.getByText('First name may be at most 30 characters long')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Telephone'), '12a');
    expect(screen.getByText('Phone number only accept digits')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Telephone'));
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Address'), 'x');
    await user.clear(screen.getByLabelText('Address'));
    expect(screen.getByText('Address is required')).toBeInTheDocument();
    await user.type(screen.getByLabelText('City'), 'x');
    await user.clear(screen.getByLabelText('City'));
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it('posts the owner and redirects to its detail page', async () => {
    const user = userEvent.setup();
    let posted: Record<string, unknown> | undefined;
    server.use(
      http.post(apiUrl('owners'), async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...posted, id: 42 }, { status: 201 });
      }),
      http.get(apiUrl('owners/42'), () =>
        HttpResponse.json({ ...makeOwners()[1], id: 42, firstName: 'Anna', lastName: 'Smith', pets: [] }),
      ),
    );
    const router = renderAt('/owners/add');
    await user.type(screen.getByLabelText('First Name'), 'Anna');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.type(screen.getByLabelText('Address'), '1 Main St');
    await user.type(screen.getByLabelText('City'), 'Springfield');
    await user.type(screen.getByLabelText('Telephone'), '5551234');
    await user.click(screen.getByRole('button', { name: 'Add Owner' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/42'));
    expect(posted).toMatchObject({ firstName: 'Anna', lastName: 'Smith', telephone: '5551234', id: null });
    expect(await screen.findByText('Anna Smith')).toBeInTheDocument();
  });

  it('shows the Spring errors header message when the POST fails', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(httpError('post', 'owners', 400, makeErrorsHeader('telephone must match "^[0-9]*$"', 'telephone')));
    renderAt('/owners/add');
    await user.type(screen.getByLabelText('First Name'), 'Anna');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.type(screen.getByLabelText('Address'), '1 Main St');
    await user.type(screen.getByLabelText('City'), 'Springfield');
    await user.type(screen.getByLabelText('Telephone'), '5551234');
    await user.click(screen.getByRole('button', { name: 'Add Owner' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('telephone must match');
    await user.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('falls back to the owners list when Back is pressed without history', async () => {
    const user = userEvent.setup();
    const router = renderAt('/owners/add');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(router.state.location.pathname).toBe('/owners');
  });
});

describe('OwnerEditPage', () => {
  it('prefills the form when opened directly and PUTs on submit', async () => {
    const user = userEvent.setup();
    let put: Record<string, unknown> | undefined;
    server.use(
      http.put(apiUrl('owners/1'), async ({ request }) => {
        put = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const router = renderAt('/owners/1/edit');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit Owner');
    expect(await screen.findByDisplayValue('George')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Franklin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6085551023')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('City'));
    await user.type(screen.getByLabelText('City'), 'Chicago');
    await user.click(screen.getByRole('button', { name: 'Update Owner' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/owners/1'));
    expect(put).toMatchObject({ id: 1, firstName: 'George', city: 'Chicago' });
  });

  it('surfaces a 404 for an unknown owner', async () => {
    silenceConsoleError();
    renderAt('/owners/999/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404|not found/i);
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
  });

  it('surfaces a network error on update', async () => {
    silenceConsoleError();
    const user = userEvent.setup();
    server.use(networkError('put', 'owners/1'));
    renderAt('/owners/1/edit');
    await screen.findByDisplayValue('George');
    await user.click(screen.getByRole('button', { name: 'Update Owner' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server');
  });
});
