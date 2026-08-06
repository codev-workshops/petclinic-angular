import { request } from "./client";
import { Visit } from "./types";

export function getVisits(): Promise<Visit[]> {
  return request<Visit[]>(
    { method: "GET", url: "visits" },
    "OwnerService",
    "getVisits",
  );
}

export function getVisitById(visitId: number | string): Promise<Visit> {
  return request<Visit>(
    { method: "GET", url: `visits/${visitId}` },
    "OwnerService",
    "getVisitById",
  );
}

export function addVisit(visit: Visit): Promise<Visit> {
  return request<Visit>(
    {
      method: "POST",
      url: `owners/${visit.pet.ownerId}/pets/${visit.pet.id}/visits`,
      data: visit,
    },
    "OwnerService",
    "addVisit",
  );
}

export function updateVisit(
  visitId: number | string,
  visit: Visit,
): Promise<Visit> {
  return request<Visit>(
    { method: "PUT", url: `visits/${visitId}`, data: visit },
    "OwnerService",
    "updateVisit",
  );
}

export function deleteVisit(visitId: number | string): Promise<number> {
  return request<number>(
    { method: "DELETE", url: `visits/${visitId}` },
    "OwnerService",
    "deleteVisit",
  );
}
