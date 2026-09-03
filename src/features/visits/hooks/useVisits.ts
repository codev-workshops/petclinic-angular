import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, Visit } from '@/models';
import { addVisit, deleteVisit, getVisitById, getVisits, queryKeys, updateVisit } from '@/services/api';

export function useVisitsQuery() {
  return useQuery({ queryKey: queryKeys.visits.list(), queryFn: getVisits });
}

export function useVisitQuery(id: EntityId | undefined) {
  return useQuery({
    queryKey: queryKeys.visits.detail(id ?? ''),
    queryFn: () => getVisitById(id as EntityId),
    enabled: id !== undefined && id !== '',
  });
}

/** Visits are embedded in pet and owner detail responses, so those caches are refreshed too. */
function useInvalidateVisits() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all }),
    ]).catch((error: unknown) => {
      console.error('Failed to refetch visits', error);
    });
}

export function useAddVisitMutation() {
  const invalidate = useInvalidateVisits();
  return useMutation({
    mutationFn: (visit: Visit) => addVisit(visit),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateVisitMutation() {
  const invalidate = useInvalidateVisits();
  return useMutation({
    mutationFn: ({ id, visit }: { id: EntityId; visit: Visit }) => updateVisit(id, visit),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteVisitMutation() {
  const invalidate = useInvalidateVisits();
  return useMutation({
    mutationFn: (id: EntityId) => deleteVisit(id),
    onSuccess: () => invalidate(),
  });
}
