import { useLoaderData, useNavigate } from "react-router-dom";
import { deletePet, deleteVisit } from "../../../api";
import type { Owner, Pet, Visit } from "../../../api/types";
import { PageContainer, PetList } from "../../../components";
import type { OwnerLoaderData } from "../loaders";

export function Component() {
  const { owner: loadedOwner } = useLoaderData() as OwnerLoaderData;
  const owner = loadedOwner ?? ({} as Owner);
  const pets = owner.pets ?? [];
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h2>Owner Information</h2>
      <table className="table table-striped">
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
      </table>
      <button
        type="button"
        className="btn btn-default"
        onClick={() => navigate("/owners")}
      >
        Back
      </button>{" "}
      <button
        type="button"
        className="btn btn-default"
        onClick={() => navigate(`/owners/${owner.id}/edit`)}
      >
        Edit Owner
      </button>{" "}
      <button
        type="button"
        className="btn btn-default"
        onClick={() => navigate(`/owners/${owner.id}/pets/add`)}
      >
        Add New Pet
      </button>
      <br />
      <br />
      <br />
      <h2>Pets and Visits</h2>
      <table className="table table-striped">
        <tbody>
          {pets.map((pet) => (
            <tr key={pet.id}>
              <td>
                <PetList
                  pet={{ ...pet, visits: pet.visits ?? [] }}
                  onEditPet={(selectedPet: Pet) =>
                    navigate(`/pets/${selectedPet.id}/edit`)
                  }
                  onAddVisit={(selectedPet: Pet) =>
                    navigate(`/pets/${selectedPet.id}/visits/add`)
                  }
                  onDeletePet={(selectedPet: Pet) => deletePet(selectedPet.id)}
                  onEditVisit={(visit: Visit) =>
                    navigate(`/visits/${visit.id}/edit`)
                  }
                  onDeleteVisit={(visit: Visit) => deleteVisit(visit.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageContainer>
  );
}
