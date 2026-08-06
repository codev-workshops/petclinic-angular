import { request } from "./client";
import { Owner } from "./types";

export function getOwners(): Promise<Owner[]> {
  return request<Owner[]>(
    { method: "GET", url: "owners" },
    "OwnerService",
    "getOwners",
  );
}

export function getOwnerById(ownerId: number | string): Promise<Owner> {
  return request<Owner>(
    { method: "GET", url: `owners/${ownerId}` },
    "OwnerService",
    "getOwnerById",
  );
}

export function addOwner(owner: Owner): Promise<Owner> {
  return request<Owner>(
    { method: "POST", url: "owners", data: owner },
    "OwnerService",
    "addOwner",
  );
}

export function updateOwner(
  ownerId: number | string,
  owner: Owner,
): Promise<Owner> {
  return request<Owner>(
    { method: "PUT", url: `owners/${ownerId}`, data: owner },
    "OwnerService",
    "updateOwner",
  );
}

export function deleteOwner(ownerId: number | string): Promise<unknown> {
  return request<unknown>(
    { method: "DELETE", url: `owners/${ownerId}` },
    "OwnerService",
    "deleteOwner",
  );
}

export function searchOwners(lastName?: string): Promise<Owner[]> {
  const url = lastName === undefined ? "owners" : `owners?lastName=${lastName}`;
  return request<Owner[]>(
    { method: "GET", url },
    "OwnerService",
    "searchOwners",
  );
}
