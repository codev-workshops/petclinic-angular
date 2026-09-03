import type { Owner } from './Owner';
import type { PetType } from './PetType';
import type { Visit } from './Visit';

/** Mirrors src/app/pets/pet.ts. `birthDate` is an RFC3339 date string (YYYY-MM-DD). */
export interface Pet {
  id: number;
  ownerId: number;
  name: string;
  birthDate: string;
  type: PetType;
  owner: Owner;
  visits: Visit[];
}
