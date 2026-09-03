import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Visit } from '@/models';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { getErrorMessage } from '@/services/api';
import { useBackNavigation } from '@/features/owners/hooks/useBackNavigation';
import { useOwnerQuery } from '@/features/owners/hooks/useOwners';
import { usePetQuery } from '@/features/pets/hooks/usePets';
import VisitForm from '@/features/visits/components/VisitForm';
import type { VisitFormValues } from '@/features/visits/components/VisitForm';
import VisitPetSummary from '@/features/visits/components/VisitPetSummary';
import VisitTable from '@/features/visits/components/VisitTable';
import { useAddVisitMutation } from '@/features/visits/hooks/useVisits';
import styles from './VisitAddPage.module.css';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';

/**
 * Port of visit-add.component. Routed as `pets/:id/visits/add` (the Angular URL) and `visits/add`;
 * the latter has no pet in the URL and only renders the form once a pet is known.
 */
export default function VisitAddPage() {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petQuery = usePetQuery(petId);
  const pet = petQuery.data;
  const ownerQuery = useOwnerQuery(pet?.ownerId);
  const owner = ownerQuery.data;
  const goBack = useBackNavigation(pet ? `/owners/${pet.ownerId}` : '/owners');
  const addMutation = useAddVisitMutation();
  const { reset } = addMutation;

  useEffect(() => () => reset(), [reset]);

  const handleSubmit = (values: VisitFormValues) => {
    if (!pet) {
      return;
    }
    reset();
    // VisitAddComponent.onSubmit: id = null, pet = currentPet; date already YYYY-MM-DD.
    const visit = {
      id: null as unknown as number,
      date: values.date,
      description: values.description,
      pet: { ...pet, owner: owner ?? pet.owner },
    } as Visit;
    addMutation.mutate(visit, {
      onSuccess: () => navigate(`/owners/${pet.ownerId}`),
    });
  };

  const errorMessage =
    petId === undefined
      ? 'Pet id is missing: open this page from a pet (pets/:id/visits/add)'
      : petQuery.error
        ? getErrorMessage(petQuery.error)
        : ownerQuery.error
          ? getErrorMessage(ownerQuery.error)
          : addMutation.error
            ? getErrorMessage(addMutation.error)
            : null;

  const dismissError = () => {
    reset();
    if (petQuery.error) {
      petQuery.refetch().catch((error: unknown) => console.error('Failed to refetch pet', error));
    }
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => console.error('Failed to refetch owner', error));
    }
  };

  const isLoading = petQuery.isLoading || (pet !== undefined && ownerQuery.isLoading);

  return (
    <Page>
      <h2>New Visit</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {isLoading && <LoadingIndicator label="Loading pet..." />}
      {!isLoading && pet && (
        <>
          <VisitPetSummary pet={pet} owner={owner} />
          <VisitForm
            submitLabel="Add Visit"
            isSubmitting={addMutation.isPending}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
          <section className={styles.previousVisits}>
            <h3>Previous Visits</h3>
            <VisitTable visits={pet.visits ?? []} />
          </section>
        </>
      )}
      {!isLoading && !pet && (
        <Button type="button" onClick={goBack}>
          Back
        </Button>
      )}
    </Page>
  );
}
