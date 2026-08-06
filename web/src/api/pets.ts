import { request } from "./client";
import { Pet } from "./types";

export function getPets(): Promise<Pet[]> {
  return request<Pet[]>(
    { method: "GET", url: "pets" },
    "PetService",
    "getPets",
  );
}

export function getPetById(petId: number | string): Promise<Pet> {
  return request<Pet>(
    { method: "GET", url: `pets/${petId}` },
    "PetService",
    "getPetById",
  );
}

export function addPet(pet: Pet): Promise<Pet> {
  return request<Pet>(
    { method: "POST", url: `owners/${pet.owner.id}/pets`, data: pet },
    "PetService",
    "addPet",
  );
}

export function updatePet(petId: number | string, pet: Pet): Promise<Pet> {
  return request<Pet>(
    { method: "PUT", url: `pets/${petId}`, data: pet },
    "PetService",
    "updatePet",
  );
}

export function deletePet(petId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `pets/${petId}` },
    "PetService",
    "deletePet",
  );
}
