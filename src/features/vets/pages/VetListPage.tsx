import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vet } from '@/models';
import { getErrorMessage } from '@/services/api';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useDeleteVetMutation, useVetsQuery } from '@/features/vets/hooks/useVets';
import styles from './VetListPage.module.css';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';

/** Port of VetListComponent (src/app/vets/vet-list). */
export default function VetListPage() {
  const navigate = useNavigate();
  const { data: vets, isLoading, error: loadError } = useVetsQuery();
  const deleteMutation = useDeleteVetMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => () => setDeleteError(null), []);

  const handleDelete = (vet: Vet) => {
    setDeleteError(null);
    deleteMutation.mutate(vet.id, {
      onError: (error) => setDeleteError(getErrorMessage(error)),
    });
  };

  const errorMessage = deleteError ?? (loadError ? getErrorMessage(loadError) : null);
  const isVetDataReceived = !isLoading;

  return (
    <Page>
      <h2>Veterinarians</h2>

      <ErrorAlert message={errorMessage} onDismiss={() => setDeleteError(null)} />

      {isLoading && <LoadingIndicator />}

      {!isLoading && (
        <Table id="vets" striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialties</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(vets ?? []).map((vet) => (
              <tr key={vet.id}>
                <td>
                  {vet.firstName} {vet.lastName}
                </td>
                <td>
                  {vet.specialties.map((spec) => (
                    <div key={spec.id}>{spec.name}</div>
                  ))}
                </td>
                <td>
                  <Button type="button" onClick={() => navigate(`/vets/${vet.id}/edit`)}>
                    Edit Vet
                  </Button>
                  <Button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(vet)}>
                    Delete Vet
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!isLoading && !loadError && (vets ?? []).length === 0 && <p className={styles.empty}>No veterinarians found</p>}

      <div>
        {isVetDataReceived && (
          <Button type="button" onClick={() => navigate('/welcome')}>
            Home
          </Button>
        )}
        {isVetDataReceived && (
          <Button type="button" onClick={() => navigate('/vets/add')}>
            Add Vet
          </Button>
        )}
      </div>
    </Page>
  );
}
