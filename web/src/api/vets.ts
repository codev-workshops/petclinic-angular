import { request } from "./client";
import { Vet } from "./types";

export function getVets(): Promise<Vet[]> {
  return request<Vet[]>(
    { method: "GET", url: "vets" },
    "VetService",
    "getVets",
  );
}

export function getVetById(vetId: number | string): Promise<Vet> {
  return request<Vet>(
    { method: "GET", url: `vets/${vetId}` },
    "VetService",
    "getVetById",
  );
}

export function updateVet(vetId: number | string, vet: Vet): Promise<Vet> {
  return request<Vet>(
    { method: "PUT", url: `vets/${vetId}`, data: vet },
    "VetService",
    "updateVet",
  );
}

export function addVet(vet: Vet): Promise<Vet> {
  return request<Vet>(
    { method: "POST", url: "vets", data: vet },
    "VetService",
    "addVet",
  );
}

export function deleteVet(vetId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `vets/${vetId}` },
    "VetService",
    "deleteVet",
  );
}
