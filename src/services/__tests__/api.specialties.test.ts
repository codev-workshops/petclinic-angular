import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { networkError } from '@/mocks/handlers';
import { makeSpecialties } from '@/mocks/data';
import { addSpecialty, deleteSpecialty, getSpecialtyById, getSpecialties, updateSpecialty } from '@/services/api';
import { expectApiError, silenceConsoleError } from './testUtils';

describe('specialties API', () => {
  it('getSpecialties lists specialties', async () => {
    const specialties = await getSpecialties();
    expect(specialties.map((s) => s.name)).toEqual(['radiology', 'surgery', 'dentistry']);
  });

  it('getSpecialtyById returns the specialty', async () => {
    const specialty = await getSpecialtyById(3);
    expect(specialty.name).toBe('dentistry');
  });

  it('addSpecialty posts to specialties', async () => {
    const created = await addSpecialty({ id: 0, name: 'cardiology' });
    expect(created).toEqual({ id: 999, name: 'cardiology' });
  });

  it('updateSpecialty puts to specialties/:id', async () => {
    const [specialty] = makeSpecialties();
    await expect(updateSpecialty(specialty.id, specialty)).resolves.toBeFalsy();
  });

  it('deleteSpecialty resolves on 204', async () => {
    await expect(deleteSpecialty(1)).resolves.toBeUndefined();
  });

  it('getSpecialtyById 404 rejects with the {} default', async () => {
    silenceConsoleError();
    const error = await expectApiError(getSpecialtyById(999));
    expect(error.status).toBe(404);
    expect(error.fallback).toEqual({});
  });

  it('getSpecialties network error rejects with the [] default', async () => {
    silenceConsoleError();
    server.use(networkError('get', 'specialties'));
    const error = await expectApiError(getSpecialties());
    expect(error.fallback).toEqual([]);
  });
});
