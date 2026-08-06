export type PetType = { id: number; name: string };
export type Specialty = { id: number; name: string };
export type Visit = { id: number; date: string; description: string; petId: number; pet?: Pet };
export type Pet = { id: number; ownerId: number; name: string; birthDate: string; type: PetType; visits: Visit[]; owner?: Owner };
export type Owner = {
  id: number; firstName: string; lastName: string; address: string; city: string;
  telephone: string; pets: Pet[];
};
export type Vet = { id: number; firstName: string; lastName: string; specialties: Specialty[] };

export type Store = {
  owners: Owner[]; pets: Pet[]; pettypes: PetType[]; specialties: Specialty[];
  vets: Vet[]; visits: Visit[];
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function createStore(): Store {
  const pettypes = [
    { id: 1, name: 'cat' }, { id: 2, name: 'dog' }, { id: 3, name: 'lizard' },
  ];
  const specialties = [
    { id: 1, name: 'radiology' }, { id: 2, name: 'surgery' }, { id: 3, name: 'dentistry' },
  ];
  const visits = [
    { id: 1, date: '2023-04-15', description: 'Annual checkup', petId: 1 },
    { id: 2, date: '2023-05-20', description: 'Vaccination', petId: 2 },
  ];
  const pets = [
    { id: 1, ownerId: 1, name: 'Leo', birthDate: '2020-01-15', type: pettypes[0], visits: [visits[0]] },
    { id: 2, ownerId: 1, name: 'Rex', birthDate: '2019-06-10', type: pettypes[1], visits: [visits[1]] },
    { id: 3, ownerId: 2, name: 'Milo', birthDate: '2021-08-05', type: pettypes[1], visits: [] },
  ];
  const owners = [
    { id: 1, firstName: 'John', lastName: 'Doe', address: '1 Main Street', city: 'Springfield', telephone: '1234567890', pets: [pets[0], pets[1]] },
    { id: 2, firstName: 'Jane', lastName: 'Smith', address: '2 Oak Avenue', city: 'Shelbyville', telephone: '5551234567', pets: [pets[2]] },
  ];
  const vets = [
    { id: 1, firstName: 'James', lastName: 'Carter', specialties: [specialties[0], specialties[1]] },
    { id: 2, firstName: 'Helen', lastName: 'Leary', specialties: [] },
  ];
  return { owners: clone(owners), pets: clone(pets), pettypes: clone(pettypes), specialties: clone(specialties), vets: clone(vets), visits: clone(visits) };
}

export function hydrate(store: Store): Store {
  for (const owner of store.owners) {
    owner.pets = store.pets.filter((pet) => pet.ownerId === owner.id);
    for (const pet of owner.pets) {
      pet.visits = store.visits.filter((visit) => visit.petId === pet.id);
    }
  }
  return store;
}

export const nextId = (values: Array<{ id: number }>) => values.reduce((max, value) => Math.max(max, value.id), 0) + 1;
