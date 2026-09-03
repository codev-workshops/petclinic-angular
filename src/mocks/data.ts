import type { Owner, Pet, PetType, Specialty, Vet, Visit } from '@/models';

/** Fixtures shaped like spring-petclinic-rest responses. Fresh copies per call keep tests independent. */

export const API_BASE_URL = 'http://localhost:9966/petclinic/api';

export function makePetTypes(): PetType[] {
  return [
    { id: 1, name: 'cat' },
    { id: 2, name: 'dog' },
    { id: 3, name: 'lizard' },
  ];
}

export function makeSpecialties(): Specialty[] {
  return [
    { id: 1, name: 'radiology' },
    { id: 2, name: 'surgery' },
    { id: 3, name: 'dentistry' },
  ];
}

export function makeVets(): Vet[] {
  const [radiology, surgery] = makeSpecialties();
  return [
    { id: 1, firstName: 'James', lastName: 'Carter', specialties: [] },
    { id: 2, firstName: 'Helen', lastName: 'Leary', specialties: [radiology] },
    { id: 3, firstName: 'Linda', lastName: 'Douglas', specialties: [surgery, makeSpecialties()[2]] },
  ];
}

// spring-petclinic-rest omits the back-references (`Pet.owner`, `Visit.pet`) that the
// Angular models declare, so the fixtures mirror real payloads and are cast accordingly.
export function makeVisits(): Visit[] {
  return [
    { id: 1, date: '2013-01-01', description: 'rabies shot', petId: 7 } as unknown as Visit,
    { id: 2, date: '2013-01-02', description: 'rabies shot', petId: 8 } as unknown as Visit,
    { id: 3, date: '2013-01-03', description: 'neutered', petId: 8 } as unknown as Visit,
  ];
}

export function makePets(): Pet[] {
  const [cat, dog] = makePetTypes();
  const visits = makeVisits();
  return [
    { id: 1, ownerId: 1, name: 'Leo', birthDate: '2010-09-07', type: cat, visits: [] } as unknown as Pet,
    { id: 7, ownerId: 6, name: 'Samantha', birthDate: '2012-09-04', type: cat, visits: [visits[0]] } as unknown as Pet,
    { id: 8, ownerId: 6, name: 'Max', birthDate: '2012-09-04', type: dog, visits: [visits[1], visits[2]] } as unknown as Pet,
  ];
}

export function makeOwners(): Owner[] {
  const pets = makePets();
  return [
    {
      id: 1,
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023',
      pets: [pets[0]],
    },
    {
      id: 2,
      firstName: 'Betty',
      lastName: 'Davis',
      address: '638 Cardinal Ave.',
      city: 'Sun Prairie',
      telephone: '6085551749',
      pets: [],
    },
    {
      id: 6,
      firstName: 'Jean',
      lastName: 'Coleman',
      address: '105 N. Lake St.',
      city: 'Monona',
      telephone: '6085552654',
      pets: [pets[1], pets[2]],
    },
  ];
}

/** Value of the Spring `errors` response header for a single FieldError. */
export function makeErrorsHeader(errorMessage: string, field = 'name'): string {
  return JSON.stringify([{ objectName: 'body', fieldName: field, fieldValue: '', errorMessage }]);
}
