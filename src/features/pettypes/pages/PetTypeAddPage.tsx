import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import PetTypeForm from '../components/PetTypeForm';
import { useAddPetTypeMutation } from '../hooks/usePetTypes';
import Page from '../../../components/ui/Page';

/**
 * Port of PettypeAddComponent (src/app/pettypes/pettype-add). Angular embeds this
 * component in the list and hides it after a successful save; as a routed page the
 * equivalent is navigating back to the list.
 */
export default function PetTypeAddPage() {
  const navigate = useNavigate();
  const addMutation = useAddPetTypeMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => () => setErrorMessage(null), []);

  const handleSubmit = (name: string) => {
    setErrorMessage(null);
    addMutation.mutate(name, {
      onSuccess: () => navigate('/pettypes'),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  return (
    <Page>
      <h2>New Pet Type</h2>
      <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      <PetTypeForm
        submitLabel="Save"
        isSubmitting={addMutation.isPending}
        onSubmit={handleSubmit}
        showRequiredOnSubmit
      />
    </Page>
  );
}
