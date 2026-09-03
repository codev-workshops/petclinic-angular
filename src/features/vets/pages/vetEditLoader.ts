import type { LoaderFunctionArgs } from 'react-router-dom';
import type { Specialty, Vet } from '@/models';
import { getErrorMessage, getSpecialties, getVetById, queryClient, queryKeys } from '@/services/api';

export interface VetEditLoaderData {
  vet: Vet | null;
  specialties: Specialty[] | null;
  /** Message of a failed resolve, surfaced by the page instead of an error boundary. */
  error: string | null;
}

/**
 * Port of `resolve: {vet: VetResolver, specs: SpecResolver}` on `vets/:id/edit`:
 * both the vet and the specialties list are in the query cache before the page renders.
 */
export async function vetEditLoader({ params }: LoaderFunctionArgs): Promise<VetEditLoaderData> {
  const id = params.id;
  if (!id) {
    return { vet: null, specialties: null, error: 'Vet id is missing.' };
  }
  try {
    const [vet, specialties] = await Promise.all([
      queryClient.ensureQueryData({ queryKey: queryKeys.vets.detail(id), queryFn: () => getVetById(id) }),
      queryClient.ensureQueryData({ queryKey: queryKeys.specialties.list(), queryFn: getSpecialties }),
    ]);
    return { vet, specialties, error: null };
  } catch (error) {
    return { vet: null, specialties: null, error: getErrorMessage(error) };
  }
}
