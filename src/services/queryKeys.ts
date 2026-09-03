import type { EntityId } from '../models';

/**
 * Query-key factory. Keys are hierarchical so that invalidating
 * `queryKeys.owners.all` also invalidates every owner detail/search query.
 */
export const queryKeys = {
  owners: {
    all: ['owners'] as const,
    list: () => [...queryKeys.owners.all, 'list'] as const,
    search: (lastName: string | undefined) => [...queryKeys.owners.all, 'search', lastName ?? ''] as const,
    detail: (id: EntityId) => [...queryKeys.owners.all, 'detail', String(id)] as const,
  },
  pets: {
    all: ['pets'] as const,
    list: () => [...queryKeys.pets.all, 'list'] as const,
    detail: (id: EntityId) => [...queryKeys.pets.all, 'detail', String(id)] as const,
  },
  visits: {
    all: ['visits'] as const,
    list: () => [...queryKeys.visits.all, 'list'] as const,
    detail: (id: EntityId) => [...queryKeys.visits.all, 'detail', String(id)] as const,
  },
  vets: {
    all: ['vets'] as const,
    list: () => [...queryKeys.vets.all, 'list'] as const,
    detail: (id: EntityId) => [...queryKeys.vets.all, 'detail', String(id)] as const,
  },
  petTypes: {
    all: ['pettypes'] as const,
    list: () => [...queryKeys.petTypes.all, 'list'] as const,
    detail: (id: EntityId) => [...queryKeys.petTypes.all, 'detail', String(id)] as const,
  },
  specialties: {
    all: ['specialties'] as const,
    list: () => [...queryKeys.specialties.all, 'list'] as const,
    detail: (id: EntityId) => [...queryKeys.specialties.all, 'detail', String(id)] as const,
  },
};
