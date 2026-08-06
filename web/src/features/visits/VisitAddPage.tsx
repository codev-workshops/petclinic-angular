import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getOwnerById } from "../../api/owners";
import { getPetById } from "../../api/pets";
import { addVisit, deleteVisit } from "../../api/visits";
import type { Owner, Pet, PetType, Visit } from "../../api/types";
import {
  DateField,
  Form,
  FormField,
  PageContainer,
  SubmitButton,
  VisitList,
} from "../../components";

const emptyPet = (): Pet => ({
  id: 0,
  ownerId: 0,
  name: "",
  birthDate: "",
  type: {} as PetType,
  owner: {} as Owner,
  visits: [],
});
const emptyOwner = (): Owner => ({
  id: 0,
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  telephone: "",
  pets: [],
});
type VisitForm = { date: string; description: string };
export async function loader({ params }: { params: { id?: string } }) {
  const pet = params.id
    ? await getPetById(params.id).catch(() => emptyPet())
    : emptyPet();
  const owner = await getOwnerById(pet.ownerId).catch(() => emptyOwner());
  return { pet, owner };
}
export function Component() {
  const { pet, owner } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const methods = useForm<VisitForm>({
    defaultValues: { date: "", description: "" },
  });
  const submit = async ({ date, description }: VisitForm) => {
    try {
      await addVisit({ id: null, pet, date, description } as unknown as Visit);
      navigate(`/owners/${owner.id}`);
    } catch {
      // Legacy stores this error without rendering it.
    }
  };
  return (
    <PageContainer title="New Visit">
      <b>Pet</b>
      <table className="table table-striped">
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
            <td>{pet.name}</td>
            <td>{pet.birthDate}</td>
            <td>{pet.type.name}</td>
            <td>{`${owner.firstName} ${owner.lastName}`}</td>
          </tr>
        </tbody>
      </table>
      <Form
        methods={methods}
        onSubmit={methods.handleSubmit(submit)}
        id="visit"
      >
        <div className="form-group">
          <DateField
            name="date"
            label="Date"
            labelFor={null}
            feedback="dirty"
            rules={{ required: true }}
            messages={{ required: "Date is required" }}
          />
          <FormField
            id="description"
            name="description"
            label="Description"
            feedback="dirty"
            rules={{ required: true, minLength: 1, maxLength: 255 }}
            messages={{
              required: "Description is required",
              minlength: "Description must be at least 1 characters long",
              maxlength: "Description may be at most 255 characters long",
            }}
          />
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <input type="hidden" name="id" id="id" />
            <input type="hidden" name="pet" id="pet" />
            <button
              className="btn btn-default"
              type="button"
              onClick={() => navigate(`/owners/${owner.id}`)}
            >
              Back
            </button>
            <SubmitButton>Add Visit</SubmitButton>
          </div>
        </div>
      </Form>
      <br />
      <div className="col-12 text-left">
        <p>
          <b>Previous Visits</b>
        </p>
      </div>
      <br />
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <VisitList
              visits={pet.visits}
              onEditVisit={(visit) => navigate(`/visits/${visit.id}/edit`)}
              onDeleteVisit={(visit) => deleteVisit(visit.id)}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
