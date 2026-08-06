import { request } from "./client";
import { PetType } from "./types";

export function getPetTypes(): Promise<PetType[]> {
  return request<PetType[]>(
    { method: "GET", url: "pettypes" },
    "OwnerService",
    "getPetTypes",
  );
}

export function getPetTypeById(typeId: number | string): Promise<PetType> {
  return request<PetType>(
    { method: "GET", url: `pettypes/${typeId}` },
    "OwnerService",
    "getPetTypeById",
  );
}

export function updatePetType(
  typeId: number | string,
  petType: PetType,
): Promise<PetType> {
  return request<PetType>(
    { method: "PUT", url: `pettypes/${typeId}`, data: petType },
    "OwnerService",
    "updatePetType",
  );
}

export function addPetType(petType: PetType): Promise<PetType> {
  return request<PetType>(
    { method: "POST", url: "pettypes", data: petType },
    "OwnerService",
    "addPetType",
  );
}

export function deletePetType(typeId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `pettypes/${typeId}` },
    "OwnerService",
    "deletePetType",
  );
}
