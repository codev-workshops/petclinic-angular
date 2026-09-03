import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, Owner } from '../../../models';
import {
  addOwner,
  deleteOwner,
  getOwnerById,
  getOwners,
  queryKeys,
  searchOwners,
  updateOwner,
} from '../../../services/api';

/** Port of OwnerService (src/app/owners/owner.service.ts) on top of TanStack Query. */

/**
 * GET owners / GET owners?lastName= (OwnerListComponent.ngOnInit + searchByLastName).
 * An empty `lastName` lists every owner, exactly like the Angular component.
 */
export function useOwnersSearchQuery(lastName: string) {
  return useQuery({
    queryKey: lastName === '' ? queryKeys.owners.list() : queryKeys.owners.search(lastName),
    queryFn: () => (lastName === '' ? getOwners() : searchOwners(lastName)),
  });
}

/** GET owners/:id (OwnerService.getOwnerById); disabled until an id is known. */
export function useOwnerQuery(id: EntityId | undefined) {
  return useQuery({
    queryKey: queryKeys.owners.detail(id ?? ''),
    queryFn: () => getOwnerById(id as EntityId),
    enabled: id !== undefined && id !== '',
  });
}

function useInvalidateOwners() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.owners.all }).catch((error: unknown) => {
      console.error('Failed to refetch owners', error);
    });
}

/** POST owners. */
export function useAddOwnerMutation() {
  const invalidate = useInvalidateOwners();
  return useMutation({
    mutationFn: (owner: Owner) => addOwner(owner),
    onSuccess: () => invalidate(),
  });
}

/** PUT owners/:id. */
export function useUpdateOwnerMutation() {
  const invalidate = useInvalidateOwners();
  return useMutation({
    mutationFn: ({ id, owner }: { id: EntityId; owner: Owner }) => updateOwner(id, owner),
    onSuccess: () => invalidate(),
  });
}

/** DELETE owners/:id; owner queries are refetched on success. */
export function useDeleteOwnerMutation() {
  const invalidate = useInvalidateOwners();
  return useMutation({
    mutationFn: (id: EntityId) => deleteOwner(id),
    onSuccess: () => invalidate(),
  });
}
