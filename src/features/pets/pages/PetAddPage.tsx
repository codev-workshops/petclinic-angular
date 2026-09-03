import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Pet } from '@/models';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { getErrorMessage } from '@/services/api';
import { useBackNavigation } from '@/features/owners/hooks/useBackNavigation';
import { useOwnerQuery } from '@/features/owners/hooks/useOwners';
import PetForm from '@/features/pets/components/PetForm';
import type { PetFormValues } from '@/features/pets/components/PetForm';
import { useAddPetMutation, usePetTypesQuery } from '@/features/pets/hooks/usePets';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';

/**
 * Port of pet-add.component. Routed as `owners/:id/pets/add` (the Angular URL) and `pets/add`;
 * the latter has no owner in the URL and only renders the form once an owner is known.
 */
export default function PetAddPage() {
  const { id: ownerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useBackNavigation(ownerId ? `/owners/${ownerId}` : '/owners');
  const ownerQuery = useOwnerQuery(ownerId);
  const petTypesQuery = usePetTypesQuery();
  const addMutation = useAddPetMutation();
  const { reset } = addMutation;

  useEffect(() => () => reset(), [reset]);

  const owner = ownerQuery.data;

  const handleSubmit = (values: PetFormValues, type: Pet['type']) => {
    if (!owner) {
      return;
    }
    reset();
    // PetAddComponent.onSubmit: id = null, owner = currentOwner, birthDate already YYYY-MM-DD.
    const pet = {
      id: null as unknown as number,
      name: values.name,
      birthDate: values.birthDate,
      type,
      owner,
      ownerId: owner.id,
      visits: [],
    } as Pet;
    addMutation.mutate(pet, {
      onSuccess: () => navigate(`/owners/${owner.id}`),
    });
  };

  const errorMessage =
    ownerId === undefined
      ? 'Owner id is missing: open this page from an owner (owners/:id/pets/add)'
      : ownerQuery.error
        ? getErrorMessage(ownerQuery.error)
        : petTypesQuery.error
          ? getErrorMessage(petTypesQuery.error)
          : addMutation.error
            ? getErrorMessage(addMutation.error)
            : null;

  const dismissError = () => {
    reset();
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => console.error('Failed to refetch owner', error));
    }
    if (petTypesQuery.error) {
      petTypesQuery.refetch().catch((error: unknown) => console.error('Failed to refetch pet types', error));
    }
  };

  const isLoading = ownerQuery.isLoading || petTypesQuery.isLoading;

  return (
    <Page>
      <h2>Add Pet</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {isLoading && <LoadingIndicator label="Loading owner..." />}
      {!isLoading && owner && (
        <PetForm
          owner={owner}
          petTypes={petTypesQuery.data ?? []}
          submitLabel="Save Pet"
          isSubmitting={addMutation.isPending}
          onSubmit={handleSubmit}
          onBack={goBack}
        />
      )}
      {!isLoading && !owner && (
        <Button type="button" onClick={goBack}>
          &lt; Back
        </Button>
      )}
    </Page>
  );
}
