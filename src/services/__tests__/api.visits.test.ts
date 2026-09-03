import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { apiUrl, networkError } from '@/mocks/handlers';
import { makePets, makeVisits } from '@/mocks/data';
import { addVisit, deleteVisit, getVisitById, getVisits, updateVisit } from '@/services/api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('visits API', () => {
  it('getVisits lists visits', async () => {
    const visits = await getVisits();
    expect(visits).toHaveLength(3);
    expect(visits[0].date).toBe('2013-01-01');
  });

  it('getVisitById returns the visit', async () => {
    const visit = await getVisitById(3);
    expect(visit.description).toBe('neutered');
  });

  it('addVisit posts to owners/:ownerId/pets/:petId/visits using visit.pet', async () => {
    let requestedUrl = '';
    server.use(
      http.post(apiUrl('owners/:ownerId/pets/:petId/visits'), async ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ ...((await request.json()) as Record<string, unknown>), id: 77 }, { status: 201 });
      }),
    );
    const samantha = makePets()[1];
    const created = await addVisit({ ...makeVisits()[0], id: 0, pet: samantha });
    expect(requestedUrl).toBe('http://localhost:9966/petclinic/api/owners/6/pets/7/visits');
    expect(created.id).toBe(77);
  });

  it('updateVisit puts to visits/:id', async () => {
    const [visit] = makeVisits();
    await expect(updateVisit(visit.id, visit)).resolves.toBeFalsy();
  });

  it('deleteVisit resolves on 204', async () => {
    await expect(deleteVisit(2)).resolves.toBeUndefined();
  });

  it('getVisitById 404 rejects with the {} default', async () => {
    silenceConsoleError();
    const error = await expectApiError(getVisitById(999));
    expect(error.status).toBe(404);
    expect(error.fallback).toEqual({});
  });

  it('getVisits network error rejects with the [] default', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'visits'));
    const error = await expectApiError(getVisits());
    expect(error.fallback).toEqual([]);
  });
});
