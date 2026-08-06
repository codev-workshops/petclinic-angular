import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { deletePetType, getPetTypes } from "../../api/pettypes";
import type { PetType } from "../../api/types";
import { PageContainer } from "../../components";
import { PettypeAddForm } from "./PettypeAddForm";

export async function loader() {
  try {
    return { petTypes: await getPetTypes() };
  } catch {
    return { petTypes: [] as PetType[] };
  }
}

export function Component() {
  const { petTypes } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [items, setItems] = useState<PetType[]>(petTypes);
  const [isInsert, setIsInsert] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setItems(petTypes), [petTypes]);

  async function remove(item: PetType) {
    await deletePetType(item.id);
    setItems((current) => current.filter(({ id }) => id !== item.id));
  }

  return (
    <PageContainer title="Pet Types">
      <table id="pettypes" className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>
                <input
                  id={String(index)}
                  readOnly
                  type="text"
                  className="form-control"
                  name="pettype_name"
                  value={item.name}
                  onChange={() => undefined}
                />
              </td>
              <td>
                <button
                  className="btn btn-default"
                  onClick={() => navigate(`/pettypes/${item.id}/edit`)}
                >
                  Edit
                </button>{" "}
                <button
                  className="btn btn-default"
                  onClick={() => void remove(item)}
                >
                  Delete
                </button>
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      {isInsert ? (
        <PettypeAddForm
          onNewPetType={(item) => {
            setItems((current) => [...current, item]);
            setIsInsert(false);
          }}
        />
      ) : null}
      <div>
        <button
          className="btn btn-default"
          onClick={() => navigate("/welcome")}
        >
          Home
        </button>{" "}
        <button
          className="btn btn-default"
          onClick={() => setIsInsert((current) => !current)}
        >
          {" Add "}
        </button>
      </div>
    </PageContainer>
  );
}
