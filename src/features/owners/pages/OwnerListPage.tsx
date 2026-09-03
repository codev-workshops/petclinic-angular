import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingIndicator from '@/components/LoadingIndicator';
import { getErrorMessage } from '@/services/api';
import { useOwnersSearchQuery } from '@/features/owners/hooks/useOwners';
import styles from './OwnerListPage.module.css';
import Page from '@/components/ui/Page';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Form from '@/components/ui/Form';
import FormActions from '@/components/ui/FormActions';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';

/** Port of owner-list.component (route `owners`). */
export default function OwnerListPage() {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);
  const ownersQuery = useOwnersSearchQuery(searchTerm);

  useEffect(() => () => setIsErrorDismissed(false), []);

  const isLoading = ownersQuery.isLoading;
  // Angular's `finalize` flips `isOwnersDataReceived` on success and on error.
  const isDataReceived = !isLoading;
  // Angular sets `owners = null` when a search fails, which shows the "not found" copy.
  const owners = ownersQuery.error ? null : ownersQuery.data;
  const hasOwners = owners !== null && owners !== undefined && owners.length > 0;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsErrorDismissed(false);
    if (lastName === searchTerm) {
      ownersQuery.refetch().catch((error: unknown) => {
        console.error('Failed to refetch owners', error);
      });
      return;
    }
    setSearchTerm(lastName);
  };

  const errorMessage = ownersQuery.error && !isErrorDismissed ? getErrorMessage(ownersQuery.error) : null;

  return (
    <Page>
      <h2>Owners</h2>

      <ErrorAlert message={errorMessage} onDismiss={() => setIsErrorDismissed(true)} />

      <Form id="search-owner-form" onSubmit={handleSearch}>
        <Field id="lastName" label="Last name">
          <Input
            size={30}
            maxLength={80}
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </Field>
        <FormActions>
          <Button type="submit" disabled={ownersQuery.isFetching}>
            Find Owner
          </Button>
        </FormActions>
      </Form>

      {isLoading && <LoadingIndicator label="Loading owners..." />}

      {!isLoading && !hasOwners && (
        <div className={styles.notFound}>No owners with LastName starting with &quot;{searchTerm}&quot;</div>
      )}

      {!isLoading && hasOwners && (
        <div id="ownersTable">
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Telephone</th>
                <th>Pets</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id}>
                  <td className="ownerFullName">
                    <Link to={`/owners/${owner.id}`}>
                      {owner.firstName} {owner.lastName}
                    </Link>
                  </td>
                  <td>{owner.address}</td>
                  <td>{owner.city}</td>
                  <td>{owner.telephone}</td>
                  <td>
                    {(owner.pets ?? []).map((pet) => (
                      <div key={pet.id}>{pet.name}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <div>
        {isDataReceived && (
          <Button type="button" onClick={() => navigate('/owners/add')}>
            Add Owner
          </Button>
        )}
      </div>
    </Page>
  );
}
