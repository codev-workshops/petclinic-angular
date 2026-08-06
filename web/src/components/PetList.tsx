import { useState } from "react";
import type { Pet, Visit } from "../api/types";
import { VisitList } from "./VisitList";

export interface PetListProps {
  pet: Pet;
  onEditPet: (pet: Pet) => void;
  onAddVisit: (pet: Pet) => void;
  onDeletePet: (pet: Pet) => Promise<unknown>;
  onEditVisit: (visit: Visit) => void;
  onDeleteVisit: (visit: Visit) => Promise<unknown>;
  onError?: (message: string) => void;
}

export function PetList({
  pet,
  onEditPet,
  onAddVisit,
  onDeletePet,
  onEditVisit,
  onDeleteVisit,
  onError,
}: PetListProps) {
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const deletePet = async () => {
    try {
      await onDeletePet(pet);
      setDeleteSuccess(true);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <table hidden={deleteSuccess} className="table table-striped">
      <tbody>
        <tr>
          <td valign="top">
            <dl className="dl-horizontal">
              <dt>Name</dt>
              <dd>{pet.name}</dd>
              <dt>Birth Date</dt>
              <dd>{pet.birthDate}</dd>
              <dt>Type</dt>
              {!deleteSuccess && <dd>{pet.type.name}</dd>}
              <button
                className="btn btn-default"
                onClick={() => onEditPet(pet)}
              >
                Edit Pet
              </button>
              <button className="btn btn-default" onClick={deletePet}>
                Delete Pet
              </button>
              <button
                className="btn btn-default"
                onClick={() => onAddVisit(pet)}
              >
                Add Visit
              </button>
            </dl>
          </td>
          <td valign="top">
            <VisitList
              visits={pet.visits}
              onEditVisit={onEditVisit}
              onDeleteVisit={onDeleteVisit}
              onError={onError}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
