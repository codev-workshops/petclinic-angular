import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, PetType } from '@/models';
import { addPetType, deletePetType, getPetTypeById, getPetTypes, queryKeys, updatePetType } from '@/services/api';

/** Port of PetTypeService (src/app/pettypes/pettype.service.ts) on top of TanStack Query. */

export function usePetTypesQuery() {
  return useQuery({
    queryKey: queryKeys.petTypes.list(),
    queryFn: getPetTypes,
  });
}

export function usePetTypeQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.petTypes.detail(id ?? ''),
    queryFn: () => getPetTypeById(id as string),
    enabled: id !== undefined && id !== '',
  });
}

export function useAddPetTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    // PettypeAddComponent.onSubmit sets `pettype.id = null` before posting.
    mutationFn: (name: string) => addPetType({ id: null as unknown as number, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.petTypes.all }),
  });
}

export function useUpdatePetTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (petType: PetType) => updatePetType(petType.id, petType),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.petTypes.all }),
  });
}

export function useDeletePetTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: EntityId) => deletePetType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.petTypes.all }),
  });
}
