import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { networkError } from '@/mocks/handlers';
import { makePetTypes } from '@/mocks/data';
import { addPetType, deletePetType, getPetTypeById, getPetTypes, updatePetType } from '@/services/api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('pet types API', () => {
  it('getPetTypes lists types', async () => {
    const types = await getPetTypes();
    expect(types.map((t) => t.name)).toEqual(['cat', 'dog', 'lizard']);
  });

  it('getPetTypeById returns the type', async () => {
    const type = await getPetTypeById(2);
    expect(type.name).toBe('dog');
  });

  it('addPetType posts to pettypes', async () => {
    const created = await addPetType({ id: 0, name: 'hamster' });
    expect(created).toEqual({ id: 999, name: 'hamster' });
  });

  it('updatePetType puts to pettypes/:id', async () => {
    const [type] = makePetTypes();
    await expect(updatePetType(type.id, type)).resolves.toBeFalsy();
  });

  it('deletePetType resolves on 204', async () => {
    await expect(deletePetType(1)).resolves.toBeUndefined();
  });

  it('getPetTypeById 404 rejects with the {} default', async () => {
    silenceConsoleError();
    const error = await expectApiError(getPetTypeById(999));
    expect(error.status).toBe(404);
    expect(error.fallback).toEqual({});
  });

  it('getPetTypes network error rejects with the [] default', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'pettypes'));
    const error = await expectApiError(getPetTypes());
    expect(error.fallback).toEqual([]);
  });
});
