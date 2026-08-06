import { request } from "./client";
import { Pet } from "./types";

export function getPets(): Promise<Pet[]> {
  return request<Pet[]>(
    { method: "GET", url: "pets" },
    "OwnerService",
    "getPets",
  );
}

export function getPetById(petId: number | string): Promise<Pet> {
  return request<Pet>(
    { method: "GET", url: `pets/${petId}` },
    "OwnerService",
    "getPetById",
  );
}

export function addPet(pet: Pet): Promise<Pet> {
  return request<Pet>(
    { method: "POST", url: `owners/${pet.owner.id}/pets`, data: pet },
    "OwnerService",
    "addPet",
  );
}

export function updatePet(petId: number | string, pet: Pet): Promise<Pet> {
  return request<Pet>(
    { method: "PUT", url: `pets/${petId}`, data: pet },
    "OwnerService",
    "updatePet",
  );
}

export function deletePet(petId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `pets/${petId}` },
    "OwnerService",
    "deletePet",
  );
}
