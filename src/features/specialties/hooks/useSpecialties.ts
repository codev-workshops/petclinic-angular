import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, Specialty } from '@/models';
import {
  addSpecialty,
  deleteSpecialty,
  getSpecialties,
  getSpecialtyById,
  queryKeys,
  updateSpecialty,
} from '@/services/api';

/** GET specialties (SpecialtyService.getSpecialties). */
export function useSpecialtiesQuery() {
  return useQuery({
    queryKey: queryKeys.specialties.list(),
    queryFn: getSpecialties,
  });
}

/** GET specialties/:id (SpecialtyService.getSpecialtyById); disabled until an id is known. */
export function useSpecialtyQuery(id: EntityId | undefined) {
  return useQuery({
    queryKey: queryKeys.specialties.detail(id ?? ''),
    queryFn: () => getSpecialtyById(id as EntityId),
    enabled: id !== undefined && id !== '',
  });
}

function useInvalidateSpecialties() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.specialties.all }).catch((error: unknown) => {
      console.error('Failed to refetch specialties', error);
    });
}

/** POST specialties. */
export function useAddSpecialty() {
  const invalidate = useInvalidateSpecialties();
  return useMutation({
    mutationFn: (specialty: Specialty) => addSpecialty(specialty),
    onSuccess: () => invalidate(),
  });
}

/** PUT specialties/:id. */
export function useUpdateSpecialty() {
  const invalidate = useInvalidateSpecialties();
  return useMutation({
    mutationFn: ({ id, specialty }: { id: EntityId; specialty: Specialty }) => updateSpecialty(id, specialty),
    onSuccess: () => invalidate(),
  });
}

/** DELETE specialties/:id; the list is refetched on success. */
export function useDeleteSpecialty() {
  const invalidate = useInvalidateSpecialties();
  return useMutation({
    mutationFn: (id: EntityId) => deleteSpecialty(id),
    onSuccess: () => invalidate(),
  });
}
