import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PetType } from '../../../models';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useDeletePetTypeMutation, usePetTypesQuery } from '../hooks/usePetTypes';
import styles from './PetTypeListPage.module.css';
import Page from '../../../components/ui/Page';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

/** Port of PettypeListComponent (src/app/pettypes/pettype-list). */
export default function PetTypeListPage() {
  const navigate = useNavigate();
  const { data: petTypes, isLoading, error: loadError } = usePetTypesQuery();
  const deleteMutation = useDeletePetTypeMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => () => setDeleteError(null), []);

  const handleDelete = (petType: PetType) => {
    setDeleteError(null);
    deleteMutation.mutate(petType.id, {
      onError: (error) => setDeleteError(getErrorMessage(error)),
    });
  };

  const errorMessage = deleteError ?? (loadError ? getErrorMessage(loadError) : null);
  const isDataReceived = !isLoading;

  return (
    <Page>
      <h2>Pet Types</h2>

      <ErrorAlert message={errorMessage} onDismiss={() => setDeleteError(null)} />

      {isLoading && <LoadingIndicator />}

      {!isLoading && (
        <Table id="pettypes" striped>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(petTypes ?? []).map((petType, index) => (
              <tr key={petType.id}>
                <td>
                  <Input
                    id={String(index)}
                    readOnly
                    type="text"
                    value={petType.name}
                    name="pettype_name"
                    aria-label={`Pet type ${petType.name}`}
                  />
                </td>
                <td>
                  <Button type="button" onClick={() => navigate(`/pettypes/${petType.id}/edit`)}>
                    Edit
                  </Button>
                  <Button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(petType)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!isLoading && !loadError && (petTypes ?? []).length === 0 && <p className={styles.empty}>No pet types found</p>}

      <div>
        {isDataReceived && (
          <Button type="button" onClick={() => navigate('/welcome')}>
            Home
          </Button>
        )}
        {isDataReceived && (
          <Button type="button" onClick={() => navigate('/pettypes/add')}>
            Add
          </Button>
        )}
      </div>
    </Page>
  );
}
