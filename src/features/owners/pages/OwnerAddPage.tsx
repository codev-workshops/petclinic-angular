import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Owner } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import { getErrorMessage } from '../../../services/api';
import OwnerForm from '../components/OwnerForm';
import type { OwnerFormValues } from '../components/OwnerForm';
import { useAddOwnerMutation } from '../hooks/useOwners';
import { useBackNavigation } from '../hooks/useBackNavigation';

/**
 * Port of owner-add.component (route `owners/add`). Angular returns to the list after
 * saving; here the new owner's detail page is opened instead (AGENTS.md navigation rule).
 */
export default function OwnerAddPage() {
  const navigate = useNavigate();
  const goBack = useBackNavigation('/owners');
  const addMutation = useAddOwnerMutation();
  const { reset } = addMutation;

  useEffect(() => () => reset(), [reset]);

  const handleSubmit = (values: OwnerFormValues) => {
    reset();
    // OwnerAddComponent.onSubmit sets `owner.id = null` before posting.
    const owner = { ...values, id: null as unknown as number, pets: [] } as Owner;
    addMutation.mutate(owner, {
      onSuccess: (created) => navigate(created?.id ? `/owners/${created.id}` : '/owners'),
    });
  };

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>New Owner</h2>
        <ErrorAlert message={addMutation.error ? getErrorMessage(addMutation.error) : null} onDismiss={reset} />
        <OwnerForm submitLabel="Add Owner" isSubmitting={addMutation.isPending} onSubmit={handleSubmit} onBack={goBack} />
      </div>
    </div>
  );
}
