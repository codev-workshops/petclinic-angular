import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId, Vet } from '@/models';
import { addVet, deleteVet, getSpecialties, getVetById, getVets, queryKeys, updateVet } from '@/services/api';

/** Port of VetService (src/app/vets/vet.service.ts) on top of TanStack Query. */

export function useVetsQuery() {
  return useQuery({
    queryKey: queryKeys.vets.list(),
    queryFn: getVets,
  });
}

export function useVetQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vets.detail(id ?? ''),
    queryFn: () => getVetById(id as string),
    enabled: id !== undefined && id !== '',
  });
}

/** Read-only list of specialties (SpecialtyService.getSpecialties) used by the add/edit forms. */
export function useSpecialtiesQuery() {
  return useQuery({
    queryKey: queryKeys.specialties.list(),
    queryFn: getSpecialties,
  });
}

export function useAddVetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    // VetAddComponent.onSubmit sets `vet.id = null` before posting.
    mutationFn: (vet: Omit<Vet, 'id'>) => addVet({ ...vet, id: null as unknown as number }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vets.all }),
  });
}

export function useUpdateVetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vet: Vet) => updateVet(vet.id, vet),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vets.all }),
  });
}

export function useDeleteVetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: EntityId) => deleteVet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vets.all }),
  });
}
