import type { Specialty } from './Specialty';

/** Mirrors src/app/vets/vet.ts */
export interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  specialties: Specialty[];
}
