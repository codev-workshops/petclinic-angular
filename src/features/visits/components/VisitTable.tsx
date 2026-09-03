import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Visit } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import { getErrorMessage } from '../../../services/api';
import { useDeleteVisitMutation } from '../hooks/useVisits';
import styles from './VisitTable.module.css';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

interface VisitTableProps {
  visits: Visit[];
}

/**
 * Port of visit-list.component: the visits of one pet with Edit/Delete actions.
 * Angular hides the table (`[hidden]="noVisits"`) once the last visit is deleted; here the
 * table is hidden whenever there are no visits, and deleting refetches the owner/pet.
 */
export default function VisitTable({ visits }: VisitTableProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteVisitMutation();
  const { reset } = deleteMutation;

  useEffect(() => () => reset(), [reset]);

  const handleDelete = (visit: Visit) => {
    reset();
    deleteMutation.mutate(visit.id);
  };

  return (
    <>
      <ErrorAlert message={deleteMutation.error ? getErrorMessage(deleteMutation.error) : null} onDismiss={reset} />
      {visits.length > 0 && (
        <Table condensed>
          <thead>
            <tr>
              <th>Visit Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id}>
                <td>{visit.date}</td>
                <td>{visit.description}</td>
                <td className={styles.actions}>
                  <Button type="button" onClick={() => navigate(`/visits/${visit.id}/edit`)}>
                    Edit Visit
                  </Button>
                  <Button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(visit)}>
                    Delete Visit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
