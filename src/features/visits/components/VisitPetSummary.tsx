import type { Owner, Pet } from '@/models';
import Table from '@/components/ui/Table';

interface VisitPetSummaryProps {
  pet: Pet | undefined;
  owner: Owner | undefined;
}

/** The "Pet" table at the top of visit-add / visit-edit templates. */
export default function VisitPetSummary({ pet, owner }: VisitPetSummaryProps) {
  return (
    <>
      <b>Pet</b>
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Birth Date</th>
            <th>Type</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{pet?.name}</td>
            <td>{pet?.birthDate}</td>
            <td>{pet?.type?.name}</td>
            <td>{owner ? `${owner.firstName} ${owner.lastName}` : ''}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
