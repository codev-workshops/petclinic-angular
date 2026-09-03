import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import { usePetsQuery } from '../hooks/usePets';
import styles from './PetListPage.module.css';

/**
 * Route `pets`. Angular mounted PetListComponent here without any input (it rendered an empty
 * card); this page lists every pet from `GET pets` instead, linking to the owner and the edit form.
 */
export default function PetListPage() {
  const petsQuery = usePetsQuery();
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);
  const pets = petsQuery.data ?? [];

  const dismissError = () => {
    setIsErrorDismissed(true);
  };

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>Pets</h2>
        <ErrorAlert
          message={petsQuery.error && !isErrorDismissed ? getErrorMessage(petsQuery.error) : null}
          onDismiss={dismissError}
        />
        {petsQuery.isLoading && <LoadingIndicator label="Loading pets..." />}
        {!petsQuery.isLoading && !petsQuery.error && pets.length === 0 && <p className={styles.empty}>No pets found</p>}
        {!petsQuery.isLoading && pets.length > 0 && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Birth Date</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>{pet.name}</td>
                  <td>{pet.birthDate}</td>
                  <td>{pet.type?.name}</td>
                  <td>
                    <Link to={`/owners/${pet.ownerId}`}>Owner {pet.ownerId}</Link>
                  </td>
                  <td>
                    <Link to={`/pets/${pet.id}/edit`}>Edit Pet</Link>{' '}
                    <Link to={`/pets/${pet.id}/visits/add`}>Add Visit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
