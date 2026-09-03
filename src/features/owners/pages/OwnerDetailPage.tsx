import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import PetCard from '../../pets/components/PetCard';
import { useDeleteOwnerMutation, useOwnerQuery } from '../hooks/useOwners';
import styles from './OwnerDetailPage.module.css';
import Page from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

/**
 * Port of owner-detail.component (route `owners/:id`). The "Delete Owner" button has no
 * Angular counterpart; it completes the CRUD set exposed by OwnerService.deleteOwner.
 */
export default function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ownerQuery = useOwnerQuery(id);
  const deleteMutation = useDeleteOwnerMutation();
  const { reset: resetDelete } = deleteMutation;

  useEffect(() => () => resetDelete(), [resetDelete]);

  const owner = ownerQuery.data;

  const errorMessage =
    id === undefined
      ? 'Owner id is missing'
      : ownerQuery.error
        ? getErrorMessage(ownerQuery.error)
        : deleteMutation.error
          ? getErrorMessage(deleteMutation.error)
          : null;

  const dismissError = () => {
    resetDelete();
    if (ownerQuery.error) {
      ownerQuery.refetch().catch((error: unknown) => {
        console.error('Failed to refetch owner', error);
      });
    }
  };

  const handleDelete = () => {
    if (!owner) {
      return;
    }
    resetDelete();
    deleteMutation.mutate(owner.id, { onSuccess: () => navigate('/owners') });
  };

  return (
    <Page>
      <h2>Owner Information</h2>

      <ErrorAlert message={errorMessage} onDismiss={dismissError} />
      {ownerQuery.isLoading && <LoadingIndicator label="Loading owner..." />}

      {owner && (
        <>
          <Table striped>
            <tbody>
              <tr>
                <th>Name</th>
                <td>
                  <b className="ownerFullName">
                    {owner.firstName} {owner.lastName}
                  </b>
                </td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{owner.address}</td>
              </tr>
              <tr>
                <th>City</th>
                <td>{owner.city}</td>
              </tr>
              <tr>
                <th>Telephone</th>
                <td>{owner.telephone}</td>
              </tr>
            </tbody>
          </Table>

          <div className={styles.actions}>
            <Button type="button" onClick={() => navigate('/owners')}>
              Back
            </Button>
            <Button type="button" onClick={() => navigate(`/owners/${owner.id}/edit`)}>
              Edit Owner
            </Button>
            <Button type="button" onClick={() => navigate(`/owners/${owner.id}/pets/add`)}>
              Add New Pet
            </Button>
            <Button type="button" disabled={deleteMutation.isPending} onClick={handleDelete}>
              Delete Owner
            </Button>
          </div>

          <h2 className={styles.petsHeading}>Pets and Visits</h2>

          {(owner.pets ?? []).length === 0 && <p className={styles.empty}>No pets found</p>}
          {(owner.pets ?? []).map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </>
      )}

      {!ownerQuery.isLoading && !owner && (
        <Button type="button" onClick={() => navigate('/owners')}>
          Back
        </Button>
      )}
    </Page>
  );
}
