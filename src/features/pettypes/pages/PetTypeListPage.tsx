import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PetType } from '../../../models';
import { getErrorMessage } from '../../../services/api';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useDeletePetTypeMutation, usePetTypesQuery } from '../hooks/usePetTypes';
import styles from './PetTypeListPage.module.css';

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
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>Pet Types</h2>

        <ErrorAlert message={errorMessage} onDismiss={() => setDeleteError(null)} />

        {isLoading && <LoadingIndicator />}

        {!isLoading && (
          <table id="pettypes" className="table table-striped">
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
                    <input
                      id={String(index)}
                      readOnly
                      type="text"
                      className="form-control"
                      value={petType.name}
                      name="pettype_name"
                      aria-label={`Pet type ${petType.name}`}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-default"
                      type="button"
                      onClick={() => navigate(`/pettypes/${petType.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-default"
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(petType)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && !loadError && (petTypes ?? []).length === 0 && (
          <p className={styles.empty}>No pet types found</p>
        )}

        <div>
          {isDataReceived && (
            <button className="btn btn-default" type="button" onClick={() => navigate('/welcome')}>
              Home
            </button>
          )}
          {isDataReceived && (
            <button className="btn btn-default" type="button" onClick={() => navigate('/pettypes/add')}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
