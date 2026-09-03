import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import VetForm from '../components/VetForm';
import type { VetFormValues } from '../components/VetForm';
import { useAddVetMutation, useSpecialtiesQuery } from '../hooks/useVets';

/** Port of VetAddComponent (src/app/vets/vet-add). */
export default function VetAddPage() {
  const navigate = useNavigate();
  const { data: specialties, isLoading, error: loadError } = useSpecialtiesQuery();
  const addMutation = useAddVetMutation();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => () => setSaveError(null), []);

  const gotoVetList = () => navigate('/vets');

  const handleSubmit = (values: VetFormValues) => {
    setSaveError(null);
    addMutation.mutate(values, {
      onSuccess: gotoVetList,
      onError: (error) => setSaveError(getErrorMessage(error)),
    });
  };

  const errorMessage = saveError ?? (loadError ? getErrorMessage(loadError) : null);

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>New Veterinarian</h2>
        <ErrorAlert message={errorMessage} onDismiss={() => setSaveError(null)} />
        {isLoading && <LoadingIndicator />}
        {!isLoading && (
          <VetForm
            variant="add"
            specialties={specialties ?? []}
            isSubmitting={addMutation.isPending}
            onSubmit={handleSubmit}
            onBack={gotoVetList}
          />
        )}
      </div>
    </div>
  );
}
