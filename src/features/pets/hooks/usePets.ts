import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, Pet } from '../../../models';
import { addPet, deletePet, getPetById, getPets, getPetTypes, queryKeys, updatePet } from '../../../services/api';

export function usePetsQuery() {
  return useQuery({ queryKey: queryKeys.pets.list(), queryFn: getPets });
}

export function usePetQuery(id: EntityId | undefined) {
  return useQuery({
    queryKey: queryKeys.pets.detail(id ?? ''),
    queryFn: () => getPetById(id as EntityId),
    enabled: id !== undefined && id !== '',
  });
}

export function usePetTypesQuery() {
  return useQuery({ queryKey: queryKeys.petTypes.list(), queryFn: getPetTypes });
}

/** Pets are embedded in owner detail responses, so owner queries must be refreshed too. */
export function useInvalidatePets() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all }),
    ]).catch((error: unknown) => {
      console.error('Failed to refetch pets', error);
    });
}

export function useAddPetMutation() {
  const invalidate = useInvalidatePets();
  return useMutation({
    mutationFn: (pet: Pet) => addPet(pet),
    onSuccess: () => invalidate(),
  });
}

export function useUpdatePetMutation() {
  const invalidate = useInvalidatePets();
  return useMutation({
    mutationFn: ({ id, pet }: { id: EntityId; pet: Pet }) => updatePet(id, pet),
    onSuccess: () => invalidate(),
  });
}

export function useDeletePetMutation() {
  const invalidate = useInvalidatePets();
  return useMutation({
    mutationFn: (id: EntityId) => deletePet(id),
    onSuccess: () => invalidate(),
  });
}
