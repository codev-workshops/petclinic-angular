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
import { useUpdateVisitMutation, useVisitQuery } from '../hooks/useVisits';

/** Port of visit-edit.component (route `visits/:id/edit`). */
export default function VisitEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitQuery = useVisitQuery(id);
  const visit = visitQuery.data;
  const petId = visit?.petId ?? visit?.pet?.id;
  const petQuery = usePetQuery(petId);
  const pet = petQuery.data;
  const ownerQuery = useOwnerQuery(pet?.ownerId);
  const owner = ownerQuery.data;
  const goBack = useBackNavigation(pet ? `/owners/${pet.ownerId}` : '/owners');
  const updateMutation = useUpdateVisitMutation();
  const { reset } = updateMutation;

  useEffect(() => () => reset(), [reset]);

  const handleSubmit = (values: VisitFormValues) => {
    if (!visit || !pet) {
      return;
    }
    reset();
    // VisitEditComponent.onSubmit: visit.pet = currentPet; date already YYYY-MM-DD.
    const updated: Visit = {
      ...visit,
      date: values.date,
      description: values.description,
      pet: { ...pet, owner: owner ?? pet.owner },
    };
    updateMutation.mutate({ id: visit.id, visit: updated }, { onSuccess: () => navigate(`/owners/${pet.ownerId}`) });
  };

  const errorMessage =
    id === undefined
      ? 'Visit id is missing'
      : visitQuery.error
        ? getErrorMessage(visitQuery.error)
        : petQuery.error
          ? getErrorMessage(petQuery.error)
          : ownerQuery.error
            ? getErrorMessage(ownerQuery.error)
            : updateMutation.error
              ? getErrorMessage(updateMutation.error)
              : null;

  const dismissError = () => {
    reset();
    if (visitQuery.error) {
      visitQuery.refetch().catch((error: unknown) => console.error('Failed to refetch visit', error));
    }
    if (petQuery.error) {
      petQuery.refetch().catch((error: unknown) => console.error('Failed to refetch pet', error));
    }
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => console.error('Failed to refetch owner', error));
    }
  };

  const isLoading =
    visitQuery.isLoading ||
    (visit !== undefined && petId !== undefined && petQuery.isLoading) ||
    (pet !== undefined && ownerQuery.isLoading);

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>Edit Visit</h2>
        <ErrorAlert message={errorMessage} onDismiss={dismissError} />
        {isLoading && <LoadingIndicator label="Loading visit..." />}
        {!isLoading && visit && (
          <>
            <VisitPetSummary pet={pet} owner={owner} />
            <VisitForm
              key={visit.id}
              visit={visit}
              submitLabel="Update Visit"
              isSubmitting={updateMutation.isPending}
              onSubmit={handleSubmit}
              onBack={goBack}
            />
          </>
        )}
        {!isLoading && !visit && (
          <button className="btn btn-default" type="button" onClick={goBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
