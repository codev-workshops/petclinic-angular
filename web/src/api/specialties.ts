import { request } from "./client";
import { Specialty } from "./types";

export function getSpecialties(): Promise<Specialty[]> {
  return request<Specialty[]>(
    { method: "GET", url: "specialties" },
    "SpecialtyService",
    "getSpecialties",
  );
}

export function getSpecialtyById(specId: number | string): Promise<Specialty> {
  return request<Specialty>(
    { method: "GET", url: `specialties/${specId}` },
    "SpecialtyService",
    "getSpecialtyById",
  );
}

export function addSpecialty(specialty: Specialty): Promise<Specialty> {
  return request<Specialty>(
    { method: "POST", url: "specialties", data: specialty },
    "SpecialtyService",
    "addSpecialty",
  );
}

export function updateSpecialty(
  specId: number | string,
  specialty: Specialty,
): Promise<Specialty> {
  return request<Specialty>(
    { method: "PUT", url: `specialties/${specId}`, data: specialty },
    "SpecialtyService",
    "updateSpecialty",
  );
}

export function deleteSpecialty(specId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `specialties/${specId}` },
    "SpecialtyService",
    "deleteSpecialty",
  );
}
