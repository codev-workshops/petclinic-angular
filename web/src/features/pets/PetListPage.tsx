import { useNavigate } from "react-router-dom";
import { deletePet } from "../../api/pets";
import { deleteVisit } from "../../api/visits";
import type { Pet, Visit } from "../../api/types";
import { PetList } from "../../components";

const emptyPet = {
  id: 0,
  ownerId: 0,
  name: "",
  birthDate: "",
  type: {},
  owner: {},
  visits: [],
} as unknown as Pet;
export function Component() {
  const navigate = useNavigate();
  return (
    <PetList
      pet={emptyPet}
      onEditPet={(pet) => navigate(`/pets/${pet.id}/edit`)}
      onAddVisit={(pet) => navigate(`/pets/${pet.id}/visits/add`)}
      onDeletePet={(pet) => deletePet(pet.id)}
      onEditVisit={(visit) => navigate(`/visits/${visit.id}/edit`)}
      onDeleteVisit={(visit: Visit) => deleteVisit(visit.id)}
    />
  );
}
