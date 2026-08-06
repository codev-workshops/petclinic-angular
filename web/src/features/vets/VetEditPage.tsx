import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getSpecialties } from "../../api/specialties";
import { getVetById, updateVet } from "../../api/vets";
import type { Specialty, Vet } from "../../api/types";
import {
  Form,
  FormField,
  PageContainer,
  SelectField,
  SubmitButton,
} from "../../components";

interface Values extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  specialties: Specialty[];
}

export async function loader({ params }: { params: { id?: string } }) {
  const fallback = {
    id: Number(params.id),
    firstName: "",
    lastName: "",
    specialties: [],
  } as Vet;
  const [vet, specialties] = await Promise.all([
    getVetById(params.id ?? "").catch(() => fallback),
    getSpecialties().catch(() => [] as Specialty[]),
  ]);
  return { vet, specialties };
}

const rules = {
  required: true,
  minLength: 2,
  maxLength: 30,
  pattern: "^[A-Za-z]*$",
};
const firstMessages = {
  maxlength: "First Name may be only 30 characters long",
  minlength: "First Name must be at least 1 characters long",
  pattern: "First Name may only consist of letters",
  required: "First Name is required",
};
const lastMessages = {
  maxlength: "Last Name may be only 30 characters long",
  minlength: "Last Name must be at least 1 characters long",
  pattern: "Last Name may only consist of letters",
  required: "Last Name is required",
};

export function Component() {
  const { vet, specialties } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();
  const methods = useForm<Values>({
    defaultValues: {
      firstName: vet.firstName,
      lastName: vet.lastName,
      specialties: vet.specialties,
    },
  });
  useEffect(() => {
    methods.reset({
      firstName: vet.firstName,
      lastName: vet.lastName,
      specialties: vet.specialties,
    });
  }, [methods, vet]);
  const submit = methods.handleSubmit(async (values) => {
    await updateVet(vet.id, {
      id: vet.id,
      firstName: values.firstName,
      lastName: values.lastName,
      specialties: values.specialties,
    });
    navigate("/vets");
  });
  return (
    <PageContainer title="Edit Veterinarian">
      <Form methods={methods} id="vet_form" onSubmit={submit}>
        <div className="form-group" hidden>
          <input
            type="text"
            hidden
            className="form-control"
            id="id"
            name="id"
            value={vet.id}
            readOnly
          />
        </div>
        <FormField
          name="firstName"
          label="First Name"
          labelClassName="col-sm-2 control-label"
          controlClassName="col-sm-10"
          rules={rules}
          messages={firstMessages}
          feedback="dirty"
          maxLength={30}
        />
        <FormField
          name="lastName"
          label="Last Name"
          labelClassName="col-sm-2 control-label"
          controlClassName="col-sm-10"
          rules={rules}
          messages={lastMessages}
          feedback="dirty"
          maxLength={30}
        />
        <SelectField
          name="specialties"
          label="Specialties"
          labelFor="spec"
          id="spec"
          options={specialties}
          multiple
        />
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <br />
            <button
              className="btn btn-default"
              type="button"
              onClick={() => navigate("/vets")}
            >
              {"< Back"}
            </button>{" "}
            <SubmitButton>Save Vet</SubmitButton>
          </div>
        </div>
      </Form>
    </PageContainer>
  );
}
