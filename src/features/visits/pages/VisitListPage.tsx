import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorAlert from '../../../components/ErrorAlert';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { getErrorMessage } from '../../../services/api';
import { useVisitsQuery } from '../hooks/useVisits';
import styles from './VisitListPage.module.css';

/**
 * Route `visits`. Angular mounted VisitListComponent here with no input (an empty table);
 * this page lists every visit from `GET visits` instead.
 */
export default function VisitListPage() {
  const visitsQuery = useVisitsQuery();
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);
  const visits = visitsQuery.data ?? [];

  return (
    <div className="container-fluid">
      <div className="container xd-container">
        <h2>Visits</h2>
        <ErrorAlert
          message={visitsQuery.error && !isErrorDismissed ? getErrorMessage(visitsQuery.error) : null}
          onDismiss={() => setIsErrorDismissed(true)}
        />
        {visitsQuery.isLoading && <LoadingIndicator label="Loading visits..." />}
        {!visitsQuery.isLoading && !visitsQuery.error && visits.length === 0 && (
          <p className={styles.empty}>No visits found</p>
        )}
        {!visitsQuery.isLoading && visits.length > 0 && (
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
                  <td>
                    <Link to={`/visits/${visit.id}/edit`}>Edit Visit</Link>
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
