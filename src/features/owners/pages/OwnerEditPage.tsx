import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Owner } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import OwnerForm from '../components/OwnerForm';
import type { OwnerFormValues } from '../components/OwnerForm';
import { useOwnerQuery, useUpdateOwnerMutation } from '../hooks/useOwners';
import { useBackNavigation } from '../hooks/useBackNavigation';
import Page from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';

/** Port of owner-edit.component (route `owners/:id/edit`). */
export default function OwnerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useBackNavigation(id ? `/owners/${id}` : '/owners');
  const ownerQuery = useOwnerQuery(id);
  const updateMutation = useUpdateOwnerMutation();
  const { reset: resetUpdate } = updateMutation;

  useEffect(() => () => resetUpdate(), [resetUpdate]);

  const handleSubmit = (values: OwnerFormValues) => {
    if (id === undefined || !ownerQuery.data) {
      return;
    }
    resetUpdate();
    const owner: Owner = {
      ...ownerQuery.data,
      ...values,
      id: ownerQuery.data.id ?? Number(id),
    };
    updateMutation.mutate({ id, owner }, { onSuccess: () => navigate(`/owners/${owner.id}`) });
  };

  const errorMessage =
    id === undefined
      ? 'Owner id is missing'
      : ownerQuery.error
        ? getErrorMessage(ownerQuery.error)
        : updateMutation.error
          ? getErrorMessage(updateMutation.error)
          : null;

  const dismissError = () => {
    resetUpdate();
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => {
        console.error('Failed to refetch owner', error);
      });
    }
  };

  return (
    <Page>
      <h2>Edit Owner</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {ownerQuery.isLoading && <LoadingIndicator label="Loading owner..." />}
      {ownerQuery.data && (
        <OwnerForm
          key={ownerQuery.data.id}
          owner={ownerQuery.data}
          submitLabel="Update Owner"
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onBack={goBack}
          showFeedbackWhenPristine
        />
      )}
      {!ownerQuery.isLoading && !ownerQuery.data && (
        <Button type="button" onClick={goBack}>
          Back
        </Button>
      )}
    </Page>
  );
}
