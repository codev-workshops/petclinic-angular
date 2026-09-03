import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import VetForm from '../components/VetForm';
import type { VetFormValues } from '../components/VetForm';
import { useSpecialtiesQuery, useUpdateVetMutation, useVetQuery } from '../hooks/useVets';
import type { VetEditLoaderData } from './vetEditLoader';
import Page from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';

/**
 * Port of VetEditComponent (src/app/vets/vet-edit). `vetEditLoader` has already put the
 * vet and the specialties into the query cache, so the queries below resolve synchronously.
 */
export default function VetEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const loaderData = useLoaderData() as VetEditLoaderData;
  const vetQuery = useVetQuery(id);
  const specialtiesQuery = useSpecialtiesQuery();
  const updateMutation = useUpdateVetMutation();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => () => setSaveError(null), []);

  const gotoVetList = () => navigate('/vets');

  const vet = vetQuery.data ?? loaderData.vet;
  const specialties = specialtiesQuery.data ?? loaderData.specialties;
  const queryError = vetQuery.error ?? specialtiesQuery.error;
  const loadError = loaderData.error ?? (queryError ? getErrorMessage(queryError) : null);
  const isLoading = !loadError && (!vet || !specialties);

  const handleSubmit = (values: VetFormValues) => {
    if (!vet) {
      return;
    }
    setSaveError(null);
    updateMutation.mutate(
      { ...values, id: vet.id },
      {
        onSuccess: gotoVetList,
        onError: (error) => setSaveError(getErrorMessage(error)),
      },
    );
  };

  const errorMessage = saveError ?? loadError;

  return (
    <Page>
      <h2>Edit Veterinarian</h2>
      <ErrorAlert message={errorMessage} onDismiss={() => setSaveError(null)} />
      {isLoading && <LoadingIndicator />}
      {vet && specialties && (
        <VetForm
          key={vet.id}
          variant="edit"
          initialValues={{
            firstName: vet.firstName,
            lastName: vet.lastName,
            specialties: vet.specialties ?? [],
          }}
          specialties={specialties}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onBack={gotoVetList}
        />
      )}
      {loadError && !vet && (
        <Button type="button" onClick={gotoVetList}>
          &lt; Back
        </Button>
      )}
    </Page>
  );
}
