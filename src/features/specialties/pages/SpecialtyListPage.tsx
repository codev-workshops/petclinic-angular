import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Specialty } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import { useDeleteSpecialty, useSpecialtiesQuery } from '../hooks/useSpecialties';
import SpecialtyAdd from '../components/SpecialtyAdd';
import styles from './SpecialtyListPage.module.css';
import Page from '../../../components/ui/Page';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

/** Port of specialty-list.component (route `specialties`). */
export default function SpecialtyListPage() {
  const navigate = useNavigate();
  const specialtiesQuery = useSpecialtiesQuery();
  const deleteMutation = useDeleteSpecialty();
  const { reset: resetDelete } = deleteMutation;
  const [isInsert, setIsInsert] = useState(false);

  useEffect(() => () => resetDelete(), [resetDelete]);

  const isLoading = specialtiesQuery.isLoading;
  const specialties = specialtiesQuery.data ?? [];
  // Angular's `finalize` flips `isSpecialitiesDataReceived` on success and on error.
  const isDataReceived = !isLoading;

  const errorMessage = specialtiesQuery.error
    ? getErrorMessage(specialtiesQuery.error)
    : deleteMutation.error
      ? getErrorMessage(deleteMutation.error)
      : null;

  const dismissError = () => {
    resetDelete();
    if (specialtiesQuery.error) {
      specialtiesQuery.refetch().catch((error: unknown) => {
        console.error('Failed to refetch specialties', error);
      });
    }
  };

  const handleDelete = (specialty: Specialty) => {
    resetDelete();
    deleteMutation.mutate(specialty.id);
  };

  const handleAdded = () => {
    setIsInsert(false);
  };

  return (
    <Page>
      <h2>Specialties</h2>
      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {isLoading && <LoadingIndicator label="Loading specialties..." />}
      <Table id="specialties" striped>
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {specialties.map((specialty, index) => (
            <tr key={specialty.id}>
              <td>
                <Input
                  id={`spec_name_${index}`}
                  name="spec_name"
                  type="text"
                  readOnly
                  value={specialty.name}
                  aria-label={`Specialty name ${specialty.name}`}
                />
              </td>
              <td className={styles.actions}>
                <Button type="button" onClick={() => navigate(`/specialties/${specialty.id}/edit`)}>
                  Edit
                </Button>
                <Button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(specialty)}>
                  Delete
                </Button>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!isLoading && !specialtiesQuery.error && specialties.length === 0 && (
        <p className={styles.empty}>No specialties found</p>
      )}
      {isInsert && <SpecialtyAdd onAdded={handleAdded} />}
      <div className={styles.footerActions}>
        {isDataReceived && (
          <Button type="button" onClick={() => navigate('/welcome')}>
            Home
          </Button>
        )}
        {isDataReceived && (
          <Button type="button" onClick={() => setIsInsert((value) => !value)}>
            Add
          </Button>
        )}
      </div>
    </Page>
  );
}
