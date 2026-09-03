import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Pet, PetType } from '@/models';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { getErrorMessage } from '@/services/api';
import { useBackNavigation } from '@/features/owners/hooks/useBackNavigation';
import { useOwnerQuery } from '@/features/owners/hooks/useOwners';
import PetForm from '@/features/pets/components/PetForm';
import type { PetFormValues } from '@/features/pets/components/PetForm';
import { usePetQuery, usePetTypesQuery, useUpdatePetMutation } from '@/features/pets/hooks/usePets';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';

/** Port of pet-edit.component (route `pets/:id/edit`). */
export default function PetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petQuery = usePetQuery(id);
  const pet = petQuery.data;
  const ownerQuery = useOwnerQuery(pet?.ownerId);
  const petTypesQuery = usePetTypesQuery();
  const updateMutation = useUpdatePetMutation();
  const { reset } = updateMutation;
  const owner = ownerQuery.data;
  const goBack = useBackNavigation(pet ? `/owners/${pet.ownerId}` : '/owners');

  useEffect(() => () => reset(), [reset]);

  const handleSubmit = (values: PetFormValues, type: PetType) => {
    if (!pet) {
      return;
    }
    reset();
    // PetEditComponent.onSubmit: pet.type = currentType; owner reference kept from the loaded pet.
    const updated: Pet = {
      ...pet,
      name: values.name,
      birthDate: values.birthDate,
      type,
      owner: owner ?? pet.owner,
    };
    updateMutation.mutate({ id: pet.id, pet: updated }, { onSuccess: () => navigate(`/owners/${pet.ownerId}`) });
  };

  const errorMessage =
    id === undefined
      ? 'Pet id is missing'
      : petQuery.error
        ? getErrorMessage(petQuery.error)
        : ownerQuery.error
          ? getErrorMessage(ownerQuery.error)
          : petTypesQuery.error
            ? getErrorMessage(petTypesQuery.error)
            : updateMutation.error
              ? getErrorMessage(updateMutation.error)
              : null;

  const dismissError = () => {
    reset();
    if (petQuery.error) {
      petQuery.refetch().catch((error: unknown) => console.error('Failed to refetch pet', error));
    }
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => console.error('Failed to refetch owner', error));
    }
    if (petTypesQuery.error) {
      petTypesQuery.refetch().catch((error: unknown) => console.error('Failed to refetch pet types', error));
    }
  };

  const isLoading = petQuery.isLoading || petTypesQuery.isLoading || (pet !== undefined && ownerQuery.isLoading);

  return (
    <Page>
      <h2>Pet</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {isLoading && <LoadingIndicator label="Loading pet..." />}
      {!isLoading && pet && (
        <PetForm
          key={pet.id}
          pet={pet}
          owner={owner}
          petTypes={petTypesQuery.data ?? []}
          submitLabel="Update Pet"
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onBack={goBack}
        />
      )}
      {!isLoading && !pet && (
        <Button type="button" onClick={goBack}>
          &lt; Back
        </Button>
      )}
    </Page>
  );
}
