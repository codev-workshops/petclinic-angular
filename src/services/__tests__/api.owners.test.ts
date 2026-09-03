import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { apiUrl, httpError, networkError } from '@/mocks/handlers';
import { makeErrorsHeader, makeOwners } from '@/mocks/data';
import { addOwner, deleteOwner, getOwnerById, getOwners, searchOwners, updateOwner } from '@/services/api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('owners API', () => {
  it('getOwners lists all owners', async () => {
    const owners = await getOwners();
    expect(owners.map((o) => o.lastName)).toEqual(['Franklin', 'Davis', 'Coleman']);
  });

  it('getOwnerById returns the owner with nested pets', async () => {
    const owner = await getOwnerById(6);
    expect(owner.firstName).toBe('Jean');
    expect(owner.pets.map((p) => p.name)).toEqual(['Samantha', 'Max']);
  });

  it('searchOwners uses owners?lastName= and filters', async () => {
    let requestedUrl = '';
    server.use(
      http.get(apiUrl('owners'), ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(makeOwners().filter((o) => o.lastName === 'Davis'));
      }),
    );
    const owners = await searchOwners('Davis');
    expect(requestedUrl).toBe('http://localhost:9966/petclinic/api/owners?lastName=Davis');
    expect(owners).toHaveLength(1);
  });

  it('searchOwners without a lastName lists everything', async () => {
    const owners = await searchOwners(undefined);
    expect(owners).toHaveLength(3);
  });

  it('addOwner posts to owners and returns the created owner', async () => {
    const [owner] = makeOwners();
    const created = await addOwner({ ...owner, id: 0 });
    expect(created.id).toBe(999);
    expect(created.lastName).toBe('Franklin');
  });

  it('updateOwner puts to owners/:id', async () => {
    const [owner] = makeOwners();
    await expect(updateOwner(owner.id, owner)).resolves.toBeFalsy();
  });

  it('deleteOwner resolves on 204', async () => {
    await expect(deleteOwner(1)).resolves.toBeUndefined();
  });

  it('getOwnerById rejects with an ApiError carrying the Angular default on 404', async () => {
    silenceConsoleError();
    const error = await expectApiError(getOwnerById(4242));
    expect(error.status).toBe(404);
    expect(error.operation).toBe('getOwnerById');
    expect(error.fallback).toEqual({});
  });

  it('getOwners surfaces the Spring errors header message', async () => {
    silenceConsoleError();
    server.use(httpError('get', 'owners', 400, makeErrorsHeader('Oops from Spring')));
    const error = await expectApiError(getOwners());
    expect(error.message).toBe('Oops from Spring');
    expect(error.fallback).toEqual([]);
  });

  it('deleteOwner rejects with a network message when the server is unreachable', async () => {
    silenceConsoleError();
    server.use(networkError('delete', 'owners/1'));
    const error = await expectApiError(deleteOwner(1));
    expect(error.status).toBeUndefined();
    expect(error.fallback).toEqual(['1']);
  });
});
