import { describe, expect, it } from 'vitest';
import { server } from '../../mocks/server';
import { networkError } from '../../mocks/handlers';
import { makeVets } from '../../mocks/data';
import { addVet, deleteVet, getVetById, getVets, updateVet } from '../api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('vets API', () => {
  it('getVets lists vets with specialties', async () => {
    const vets = await getVets();
    expect(vets).toHaveLength(3);
    expect(vets[2].specialties.map((s) => s.name)).toEqual(['surgery', 'dentistry']);
  });

  it('getVetById returns the vet', async () => {
    const vet = await getVetById(2);
    expect(vet.lastName).toBe('Leary');
  });

  it('addVet posts to vets', async () => {
    const created = await addVet({ ...makeVets()[0], id: 0 });
    expect(created.id).toBe(999);
  });

  it('updateVet puts to vets/:id', async () => {
    const [vet] = makeVets();
    await expect(updateVet(vet.id, vet)).resolves.toBeFalsy();
  });

  it('deleteVet resolves on 204', async () => {
    await expect(deleteVet(1)).resolves.toBeUndefined();
  });

  it('getVetById 404 rejects with the {} default', async () => {
    silenceConsoleError();
    const error = await expectApiError(getVetById(999));
    expect(error.status).toBe(404);
    expect(error.fallback).toEqual({});
  });

  it('getVets network error rejects with the [] default', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'vets'));
    const error = await expectApiError(getVets());
    expect(error.fallback).toEqual([]);
  });
});
