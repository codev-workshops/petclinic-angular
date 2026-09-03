import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Visit } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import { useBackNavigation } from '../../owners/hooks/useBackNavigation';
import { useOwnerQuery } from '../../owners/hooks/useOwners';
import { usePetQuery } from '../../pets/hooks/usePets';
import VisitForm from '../components/VisitForm';
import type { VisitFormValues } from '../components/VisitForm';
import VisitPetSummary from '../components/VisitPetSummary';
import VisitTable from '../components/VisitTable';
import { useAddVisitMutation } from '../hooks/useVisits';

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
    addMutation.mutate(visit, { onSuccess: () => navigate(`/owners/${pet.ownerId}`) });
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
    <div className="container-fluid">
      <div className="container xd-container">
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
            <br />
            <div className="col-12 text-left">
              <p>
                <b>Previous Visits</b>
              </p>
            </div>
            <br />
            <div className="container">
              <div className="row">
                <div className="col-12 text-center">
                  <VisitTable visits={pet.visits ?? []} />
                </div>
              </div>
            </div>
          </>
        )}
        {!isLoading && !pet && (
          <button className="btn btn-default" type="button" onClick={goBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
