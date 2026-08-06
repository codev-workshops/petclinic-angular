import { useForm, useWatch } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getOwnerById } from "../../api/owners";
import { getPetById, updatePet } from "../../api/pets";
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
const emptyPet = (): Pet => ({
  id: 0,
  ownerId: 0,
  name: "",
  birthDate: "",
  type: {} as PetType,
  owner: undefined as unknown as Owner,
  visits: [],
});
type PetForm = { name: string; birthDate: string; pettype: PetType };

export async function loader({ params }: { params: { id?: string } }) {
  const pet = params.id
    ? await getPetById(params.id).catch(() => emptyPet())
    : emptyPet();
  const [petTypes, owner] = await Promise.all([
    getPetTypes().catch(() => [] as PetType[]),
    getOwnerById(pet.ownerId).catch(() => emptyOwner()),
  ]);
  return { pet, petTypes, owner };
}

export function Component() {
  const { pet, petTypes, owner } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();
  const methods = useForm<PetForm>({
    defaultValues: {
      name: pet.name,
      birthDate: pet.birthDate,
      pettype: pet.type,
    },
  });
  const selectedType = useWatch({ control: methods.control, name: "pettype" });
  const submit = async ({ name, birthDate, pettype }: PetForm) => {
    try {
      await updatePet(pet.id, {
        id: pet.id,
        owner: pet.owner,
        name,
        birthDate,
        pettype,
        type: pettype,
      } as unknown as Pet);
      navigate(`/owners/${owner.id}`);
    } catch {
      // Legacy stores this error without rendering it.
    }
  };
  return (
    <PageContainer title="Pet">
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
        <div className="control-group">
          <div className="form-group has-feedback">
            <label htmlFor="type" className="col-sm-2 control-label">
              Type{" "}
            </label>
            <div className="col-sm-10">
              <div className="col-sm-2">
                <input
                  id="type1"
                  name="type1"
                  className="form-control"
                  type="text"
                  readOnly
                  value={selectedType?.name ?? ""}
                />
              </div>
              <SelectField
                name="pettype"
                id="type"
                label=""
                labelFor={null}
                controlClassName="col-sm-8"
                feedback="dirty"
                options={petTypes}
                rules={{ required: true, minLength: 2 }}
                messages={{
                  required: "First name is required",
                  minlength: "First name must be at least 2 characters long",
                }}
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <br />
            <button
              className="btn btn-default"
              type="button"
              onClick={() => navigate(`/owners/${(pet.owner as Owner).id}`)}
            >
              &lt; Back
            </button>
            <SubmitButton>Update Pet</SubmitButton>
          </div>
        </div>
      </Form>
    </PageContainer>
  );
}
