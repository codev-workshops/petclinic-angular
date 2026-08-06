import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { addPet } from "../../api/pets";
import { getOwnerById } from "../../api/owners";
import { getPetTypes } from "../../api/pettypes";
import type { Owner, Pet, PetType } from "../../api/types";
import {
  DateField,
  Form,
  FormField,
  PageContainer,
  SelectField,
  SubmitButton,
} from "../../components";

const emptyOwner = (): Owner => ({
  id: 0,
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  telephone: "",
  pets: [],
});

type PetForm = { name: string; birthDate: string; type: PetType };

export async function loader({ params }: { params: { id?: string } }) {
  const [petTypes, owner] = await Promise.all([
    getPetTypes().catch(() => [] as PetType[]),
    params.id
      ? getOwnerById(params.id).catch(() => emptyOwner())
      : Promise.resolve(emptyOwner()),
  ]);
  return { petTypes, owner };
}

export function Component() {
  const { petTypes, owner } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();
  const methods = useForm<PetForm>({
    defaultValues: { name: "", birthDate: "", type: undefined },
  });
  const submit = async ({ name, birthDate, type }: PetForm) => {
    const pet = { id: null, owner, name, birthDate, type } as unknown as Pet;
    try {
      await addPet(pet);
      navigate(`/owners/${owner.id}`);
    } catch {
      // Legacy stores this error without rendering it.
    }
  };
  return (
    <PageContainer title="Add Pet">
      <Form methods={methods} onSubmit={methods.handleSubmit(submit)}>
        <div className="form-group" hidden>
          <input
            type="text"
            hidden
            className="form-control"
            id="id"
            name="id"
          />
          <input
            type="text"
            hidden
            className="form-control"
            id="owner"
            name="owner"
          />
        </div>
        <div className="form-group">
          <label htmlFor="owner" className="col-sm-2 control-label">
            Owner
          </label>
          <div className="col-sm-10">
            <input
              id="owner_name"
              name="owner_name"
              className="form-control"
              readOnly
              value={`${owner.firstName} ${owner.lastName}`}
            />
          </div>
        </div>
        <br />
        <FormField
          name="name"
          label="Name"
          feedback="dirty"
          rules={{
            required: true,
            minLength: 1,
            maxLength: 30,
            pattern: "^[A-Za-z0-9].{0,29}$",
          }}
          messages={{
            required: "Name is required",
            minlength: "Name must be at least 1 character long",
            maxlength: "Name may be at most 30 character long",
            pattern: "Name must begin with a letter",
          }}
        />
        <DateField
          name="birthDate"
          label="Birth Date"
          labelFor={null}
          feedback="dirty"
          rules={{ required: true }}
          messages={{ required: "BirthDate is required" }}
        />
        <SelectField
          name="type"
          id="type"
          label="Type "
          labelFor="type"
          feedback="dirty"
          options={petTypes}
          rules={{ required: true }}
          messages={{ required: "pettype is required" }}
        />
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <br />
            <button
              className="btn btn-default"
              type="button"
              onClick={() => navigate(`/owners/${owner.id}`)}
            >
              &lt; Back
            </button>
            <SubmitButton>Save Pet</SubmitButton>
          </div>
        </div>
      </Form>
    </PageContainer>
  );
}
