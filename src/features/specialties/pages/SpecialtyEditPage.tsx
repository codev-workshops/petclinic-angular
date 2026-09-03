import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Specialty } from '@/models';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { getErrorMessage } from '@/services/api';
import { useSpecialtyQuery, useUpdateSpecialty } from '@/features/specialties/hooks/useSpecialties';
import SpecialtyForm from '@/features/specialties/components/SpecialtyForm';
import styles from './SpecialtyEditPage.module.css';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';

const LIST_ROUTE = '/specialties';

/** Port of specialty-edit.component (route `specialties/:id/edit`). */
export default function SpecialtyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const specialtyQuery = useSpecialtyQuery(id);
  const updateMutation = useUpdateSpecialty();
  const { reset: resetUpdate } = updateMutation;

  useEffect(() => () => resetUpdate(), [resetUpdate]);

  // Angular's onBack() always navigates to the list, not to the previous history entry.
  const goBack = () => navigate(LIST_ROUTE);

  const handleSubmit = (specialty: Specialty) => {
    if (id === undefined) {
      return;
    }
    resetUpdate();
    updateMutation.mutate(
      { id, specialty: { ...specialty, id: specialty.id ?? Number(id) } },
      { onSuccess: () => goBack() },
    );
  };

  const errorMessage =
    id === undefined
      ? 'Specialty id is missing'
      : specialtyQuery.error
        ? getErrorMessage(specialtyQuery.error)
        : updateMutation.error
          ? getErrorMessage(updateMutation.error)
          : null;

  const dismissError = () => {
    resetUpdate();
    if (specialtyQuery.error) {
      specialtyQuery.refetch().catch((error: unknown) => {
        console.error('Failed to refetch specialty', error);
      });
    }
  };

  return (
    <Page>
      <h2>Edit Specialty</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {specialtyQuery.isLoading && <LoadingIndicator label="Loading specialty..." />}
      {specialtyQuery.data && (
        <div className={styles.formWrapper}>
          <SpecialtyForm
            key={specialtyQuery.data.id}
            specialty={specialtyQuery.data}
            submitLabel="Update"
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={goBack}
          />
        </div>
      )}
      {!specialtyQuery.isLoading && !specialtyQuery.data && (
        <Button type="button" onClick={goBack}>
          Back to specialties
        </Button>
      )}
    </Page>
  );
}
