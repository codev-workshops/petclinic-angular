import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { apiUrl, networkError } from '@/mocks/handlers';
import { makeOwners, makePets } from '@/mocks/data';
import { addPet, deletePet, getPetById, getPets, updatePet } from '@/services/api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('pets API', () => {
  it('getPets lists pets', async () => {
    const pets = await getPets();
    expect(pets.map((p) => p.name)).toEqual(['Leo', 'Samantha', 'Max']);
  });

  it('getPetById returns the pet', async () => {
    const pet = await getPetById('7');
    expect(pet.name).toBe('Samantha');
    expect(pet.type.name).toBe('cat');
  });

  it('addPet posts to owners/:ownerId/pets using pet.owner.id', async () => {
    let requestedUrl = '';
    server.use(
      http.post(apiUrl('owners/:ownerId/pets'), async ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ ...((await request.json()) as Record<string, unknown>), id: 42 }, { status: 201 });
      }),
    );
    const pet = { ...makePets()[0], id: 0, owner: makeOwners()[1] };
    const created = await addPet(pet);
    expect(requestedUrl).toBe('http://localhost:9966/petclinic/api/owners/2/pets');
    expect(created.id).toBe(42);
  });

  it('updatePet puts to pets/:id', async () => {
    const [pet] = makePets();
    await expect(updatePet(pet.id, pet)).resolves.toBeFalsy();
  });

  it('deletePet resolves on 204', async () => {
    await expect(deletePet(1)).resolves.toBeUndefined();
  });

  it('getPetById 404 rejects with the {} default', async () => {
    silenceConsoleError();
    const error = await expectApiError(getPetById(999));
    expect(error.status).toBe(404);
    expect(error.fallback).toEqual({});
  });

  it('getPets network error rejects with the [] default', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pets'));
    const error = await expectApiError(getPets());
    expect(error.fallback).toEqual([]);
  });
});
