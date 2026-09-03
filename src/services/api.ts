import axios from 'axios';
import type { EntityId, Owner, Pet, PetType, Specialty, Vet, Visit } from '../models';
import { createHandleError } from './errorHandler';

export { queryClient } from './queryClient';
export { queryKeys } from './queryKeys';
export { ApiError, getErrorMessage } from './errorHandler';

/** Same value as `environment.REST_API_URL` in the Angular app (trailing slash included). */
export const REST_API_URL = 'http://localhost:9966/petclinic/api/';

/** The single axios instance used by the whole React app. */
export const apiClient = axios.create({
  baseURL: REST_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export type { EntityId };

// Every Angular service creates its handler with the name 'OwnerService'
// (copy/paste in the original); the names below are more accurate.
const ownerError = createHandleError('OwnerService');
const petError = createHandleError('PetService');
const visitError = createHandleError('VisitService');
const vetError = createHandleError('VetService');
const petTypeError = createHandleError('PetTypeService');
const specialtyError = createHandleError('SpecialtyService');

// ---------------------------------------------------------------------------
// Owners (src/app/owners/owner.service.ts)
// ---------------------------------------------------------------------------

export function getOwners(): Promise<Owner[]> {
  return apiClient
    .get<Owner[]>('owners')
    .then((res) => res.data)
    .catch(ownerError('getOwners', [] as Owner[]));
}

export function getOwnerById(ownerId: EntityId): Promise<Owner> {
  return apiClient
    .get<Owner>(`owners/${ownerId}`)
    .then((res) => res.data)
    .catch(ownerError('getOwnerById', {} as Owner));
}

export function searchOwners(lastName: string | undefined): Promise<Owner[]> {
  const url = lastName !== undefined ? `owners?lastName=${lastName}` : 'owners';
  return apiClient
    .get<Owner[]>(url)
    .then((res) => res.data)
    .catch(ownerError('searchOwners', [] as Owner[]));
}

export function addOwner(owner: Owner): Promise<Owner> {
  return apiClient
    .post<Owner>('owners', owner)
    .then((res) => res.data)
    .catch(ownerError('addOwner', owner));
}

export function updateOwner(ownerId: EntityId, owner: Owner): Promise<Owner> {
  return apiClient
    .put<Owner>(`owners/${ownerId}`, owner)
    .then((res) => res.data)
    .catch(ownerError('updateOwner', owner));
}

export function deleteOwner(ownerId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`owners/${ownerId}`)
    .then(() => undefined)
    .catch(ownerError('deleteOwner', [String(ownerId)]));
}

// ---------------------------------------------------------------------------
// Pets (src/app/pets/pet.service.ts)
// ---------------------------------------------------------------------------

export function getPets(): Promise<Pet[]> {
  return apiClient
    .get<Pet[]>('pets')
    .then((res) => res.data)
    .catch(petError('getPets', [] as Pet[]));
}

export function getPetById(petId: EntityId): Promise<Pet> {
  return apiClient
    .get<Pet>(`pets/${petId}`)
    .then((res) => res.data)
    .catch(petError('getPetById', {} as Pet));
}

/** POST owners/{pet.owner.id}/pets — the owner id is read from the payload, as in Angular. */
export function addPet(pet: Pet): Promise<Pet> {
  const ownerId = pet.owner.id;
  return apiClient
    .post<Pet>(`owners/${ownerId}/pets`, pet)
    .then((res) => res.data)
    .catch(petError('addPet', pet));
}

export function updatePet(petId: EntityId, pet: Pet): Promise<Pet> {
  return apiClient
    .put<Pet>(`pets/${petId}`, pet)
    .then((res) => res.data)
    .catch(petError('updatePet', pet));
}

export function deletePet(petId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`pets/${petId}`)
    .then(() => undefined)
    .catch(petError('deletePet', 0));
}

// ---------------------------------------------------------------------------
// Visits (src/app/visits/visit.service.ts)
// ---------------------------------------------------------------------------

export function getVisits(): Promise<Visit[]> {
  return apiClient
    .get<Visit[]>('visits')
    .then((res) => res.data)
    .catch(visitError('getVisits', [] as Visit[]));
}

export function getVisitById(visitId: EntityId): Promise<Visit> {
  return apiClient
    .get<Visit>(`visits/${visitId}`)
    .then((res) => res.data)
    .catch(visitError('getVisitById', {} as Visit));
}

/** POST owners/{visit.pet.ownerId}/pets/{visit.pet.id}/visits — ids read from the payload, as in Angular. */
export function addVisit(visit: Visit): Promise<Visit> {
  const ownerId = visit.pet.ownerId;
  const petId = visit.pet.id;
  return apiClient
    .post<Visit>(`owners/${ownerId}/pets/${petId}/visits`, visit)
    .then((res) => res.data)
    .catch(visitError('addVisit', visit));
}

export function updateVisit(visitId: EntityId, visit: Visit): Promise<Visit> {
  return apiClient
    .put<Visit>(`visits/${visitId}`, visit)
    .then((res) => res.data)
    .catch(visitError('updateVisit', visit));
}

export function deleteVisit(visitId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`visits/${visitId}`)
    .then(() => undefined)
    .catch(visitError('deleteVisit', 0));
}

// ---------------------------------------------------------------------------
// Vets (src/app/vets/vet.service.ts)
// ---------------------------------------------------------------------------

export function getVets(): Promise<Vet[]> {
  return apiClient
    .get<Vet[]>('vets')
    .then((res) => res.data)
    .catch(vetError('getVets', [] as Vet[]));
}

export function getVetById(vetId: EntityId): Promise<Vet> {
  return apiClient
    .get<Vet>(`vets/${vetId}`)
    .then((res) => res.data)
    .catch(vetError('getVetById', {} as Vet));
}

export function addVet(vet: Vet): Promise<Vet> {
  return apiClient
    .post<Vet>('vets', vet)
    .then((res) => res.data)
    .catch(vetError('addVet', vet));
}

export function updateVet(vetId: EntityId, vet: Vet): Promise<Vet> {
  return apiClient
    .put<Vet>(`vets/${vetId}`, vet)
    .then((res) => res.data)
    .catch(vetError('updateVet', vet));
}

export function deleteVet(vetId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`vets/${vetId}`)
    .then(() => undefined)
    .catch(vetError('deleteVet', 0));
}

// ---------------------------------------------------------------------------
// Pet types (src/app/pettypes/pettype.service.ts)
// ---------------------------------------------------------------------------

export function getPetTypes(): Promise<PetType[]> {
  return apiClient
    .get<PetType[]>('pettypes')
    .then((res) => res.data)
    .catch(petTypeError('getPetTypes', [] as PetType[]));
}

export function getPetTypeById(typeId: EntityId): Promise<PetType> {
  return apiClient
    .get<PetType>(`pettypes/${typeId}`)
    .then((res) => res.data)
    .catch(petTypeError('getPetTypeById', {} as PetType));
}

export function addPetType(petType: PetType): Promise<PetType> {
  return apiClient
    .post<PetType>('pettypes', petType)
    .then((res) => res.data)
    .catch(petTypeError('addPetType', petType));
}

export function updatePetType(typeId: EntityId, petType: PetType): Promise<PetType> {
  return apiClient
    .put<PetType>(`pettypes/${typeId}`, petType)
    .then((res) => res.data)
    .catch(petTypeError('updatePetType', petType));
}

export function deletePetType(typeId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`pettypes/${typeId}`)
    .then(() => undefined)
    .catch(petTypeError('deletePetType', 0));
}

// ---------------------------------------------------------------------------
// Specialties (src/app/specialties/specialty.service.ts)
// ---------------------------------------------------------------------------

export function getSpecialties(): Promise<Specialty[]> {
  return apiClient
    .get<Specialty[]>('specialties')
    .then((res) => res.data)
    .catch(specialtyError('getSpecialties', [] as Specialty[]));
}

export function getSpecialtyById(specId: EntityId): Promise<Specialty> {
  return apiClient
    .get<Specialty>(`specialties/${specId}`)
    .then((res) => res.data)
    .catch(specialtyError('getSpecialtyById', {} as Specialty));
}

export function addSpecialty(specialty: Specialty): Promise<Specialty> {
  return apiClient
    .post<Specialty>('specialties', specialty)
    .then((res) => res.data)
    .catch(specialtyError('addSpecialty', specialty));
}

export function updateSpecialty(specId: EntityId, specialty: Specialty): Promise<Specialty> {
  return apiClient
    .put<Specialty>(`specialties/${specId}`, specialty)
    .then((res) => res.data)
    .catch(specialtyError('updateSpecialty', specialty));
}

export function deleteSpecialty(specId: EntityId): Promise<void> {
  return apiClient
    .delete<void>(`specialties/${specId}`)
    .then(() => undefined)
    .catch(specialtyError('deleteSpecialty', 0));
}
