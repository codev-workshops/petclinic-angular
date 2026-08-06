import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { deleteVet, getVets } from "../../api/vets";
import type { Vet } from "../../api/types";
import { PageContainer } from "../../components";

export async function loader() {
  try {
    return { vets: await getVets() };
  } catch {
    return { vets: [] as Vet[] };
  }
}

export function Component() {
  const { vets } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [items, setItems] = useState<Vet[]>(vets);
  const navigate = useNavigate();
  useEffect(() => setItems(vets), [vets]);

  async function remove(item: Vet) {
    await deleteVet(item.id);
    setItems((current) => current.filter(({ id }) => id !== item.id));
  }

  return (
    <PageContainer title="Veterinarians">
      <table id="vets" className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialties</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((vet) => (
            <tr key={vet.id}>
              <td>
                {vet.firstName} {vet.lastName}
              </td>
              <td>
                {vet.specialties.map((specialty) => (
                  <div key={specialty.id}>{specialty.name}</div>
                ))}
              </td>
              <td>
                <button
                  className="btn btn-default"
                  onClick={() => navigate(`/vets/${vet.id}/edit`)}
                >
                  Edit Vet
                </button>{" "}
                <button
                  className="btn btn-default"
                  onClick={() => void remove(vet)}
                >
                  Delete Vet
                </button>
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button
          className="btn btn-default"
          onClick={() => navigate("/welcome")}
        >
          Home
        </button>{" "}
        <button
          className="btn btn-default"
          onClick={() => navigate("/vets/add")}
        >
          Add Vet
        </button>
      </div>
    </PageContainer>
  );
}
