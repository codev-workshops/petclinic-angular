import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Visit } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import { getErrorMessage } from '../../../services/api';
import { useDeleteVisitMutation } from '../hooks/useVisits';
import styles from './VisitTable.module.css';

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
        <table className="table table-condensed">
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
                  <button className="btn btn-default" type="button" onClick={() => navigate(`/visits/${visit.id}/edit`)}>
                    Edit Visit
                  </button>
                  <button
                    className="btn btn-default"
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(visit)}
                  >
                    Delete Visit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
