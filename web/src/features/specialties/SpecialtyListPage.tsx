import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { deleteSpecialty, getSpecialties } from "../../api/specialties";
import type { Specialty } from "../../api/types";
import { PageContainer } from "../../components";
import { SpecialtyAddForm } from "./SpecialtyAddForm";

export async function loader() {
  try {
    return { specialties: await getSpecialties() };
  } catch {
    return { specialties: [] as Specialty[] };
  }
}

export function Component() {
  const { specialties } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [items, setItems] = useState<Specialty[]>(specialties);
  const [isInsert, setIsInsert] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setItems(specialties), [specialties]);

  async function remove(item: Specialty) {
    await deleteSpecialty(item.id);
    setItems((current) => current.filter(({ id }) => id !== item.id));
  }

  return (
    <PageContainer title="Specialties">
      <table id="specialties" className="table table-striped">
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
                  name="spec_name"
                  value={item.name}
                  onChange={() => undefined}
                />
              </td>
              <td>
                <button
                  className="btn btn-default"
                  onClick={() => navigate(`/specialties/${item.id}/edit`)}
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
        <SpecialtyAddForm
          onNewSpecialty={(item) => {
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
