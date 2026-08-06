import type { LoaderFunctionArgs } from "react-router-dom";
import { getOwnerById, getOwners } from "../../api";
import type { Owner } from "../../api/types";

export interface OwnersLoaderData {
  owners: Owner[] | null;
}

export interface OwnerLoaderData {
  owner: Owner;
}

export async function ownersLoader(): Promise<OwnersLoaderData> {
  try {
    return { owners: await getOwners() };
  } catch {
    return { owners: null };
  }
}

export async function ownerDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<OwnerLoaderData> {
  try {
    return { owner: await getOwnerById(params.id ?? "") };
  } catch {
    return { owner: {} as Owner };
  }
}

export async function ownerEditLoader({
  params,
}: LoaderFunctionArgs): Promise<OwnerLoaderData> {
  try {
    return { owner: await getOwnerById(params.id ?? "") };
  } catch {
    return { owner: {} as Owner };
  }
}
