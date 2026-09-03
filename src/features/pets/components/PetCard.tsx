import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pet } from '@/models';
import ErrorAlert from '@/components/ErrorAlert';
import { getErrorMessage } from '@/services/api';
import VisitTable from '@/features/visits/components/VisitTable';
import { useDeletePetMutation } from '@/features/pets/hooks/usePets';
import { cx } from '@/utils/cx';
import styles from './PetCard.module.css';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';

interface PetCardProps {
  pet: Pet;
}

/**
 * Port of pet-list.component: one pet with its visits, embedded in the owner detail page.
 * Deleting refetches the owner (Angular merely hid the row).
 */
export default function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeletePetMutation();
  const { reset } = deleteMutation;

  useEffect(() => () => reset(), [reset]);

  const handleDelete = () => {
    reset();
    deleteMutation.mutate(pet.id);
  };

  return (
    <Table striped data-testid={`pet-${pet.id}`}>
      <tbody>
        <tr>
          <td className={styles.top}>
            <ErrorAlert
              message={deleteMutation.error ? getErrorMessage(deleteMutation.error) : null}
              onDismiss={reset}
            />
            <dl className={cx(styles.details, 'dl-horizontal')}>
              <dt>Name</dt>
              <dd>{pet.name}</dd>
              <dt>Birth Date</dt>
              <dd>{pet.birthDate}</dd>
              <dt>Type</dt>
              <dd>{pet.type?.name}</dd>
              <div className={styles.actions}>
                <Button type="button" onClick={() => navigate(`/pets/${pet.id}/edit`)}>
                  Edit Pet
                </Button>
                <Button type="button" disabled={deleteMutation.isPending} onClick={handleDelete}>
                  Delete Pet
                </Button>
                <Button type="button" onClick={() => navigate(`/pets/${pet.id}/visits/add`)}>
                  Add Visit
                </Button>
              </div>
            </dl>
          </td>
          <td className={styles.top}>
            <VisitTable visits={pet.visits ?? []} />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}
