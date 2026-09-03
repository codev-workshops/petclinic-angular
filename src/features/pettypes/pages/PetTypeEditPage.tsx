import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PetTypeForm from '../components/PetTypeForm';
import { usePetTypeQuery, useUpdatePetTypeMutation } from '../hooks/usePetTypes';

/** Port of PettypeEditComponent (src/app/pettypes/pettype-edit). */
export default function PetTypeEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: petType, isLoading, error: loadError } = usePetTypeQuery(id);
  const updateMutation = useUpdatePetTypeMutation();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => () => setSaveError(null), []);

  const goBack = () => navigate('/pettypes');

  const handleSubmit = (name: string) => {
    if (!petType) {
      return;
    }
    setSaveError(null);
    updateMutation.mutate(
      { id: petType.id, name },
      {
        onSuccess: goBack,
        onError: (error) => setSaveError(getErrorMessage(error)),
      },
    );
  };

  const errorMessage = saveError ?? (loadError ? getErrorMessage(loadError) : null);

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>Edit Pet Type</h2>
        <ErrorAlert message={errorMessage} onDismiss={() => setSaveError(null)} />
        {isLoading && id && <LoadingIndicator />}
        {!id && <p role="alert">Pet type id is missing.</p>}
        {petType && (
          <PetTypeForm
            key={petType.id}
            initialName={petType.name}
            submitLabel="Update"
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={goBack}
          />
        )}
        {loadError && (
          <button className="btn btn-default" type="button" onClick={goBack}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
