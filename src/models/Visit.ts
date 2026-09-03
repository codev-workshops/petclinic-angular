import type { Pet } from './Pet';

/** Mirrors src/app/visits/visit.ts. `date` is an RFC3339 date string (YYYY-MM-DD). */
export interface Visit {
  id: number;
  date: string;
  description: string;
  pet: Pet;
  petId?: number;
}
