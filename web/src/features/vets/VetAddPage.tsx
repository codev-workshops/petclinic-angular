import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { addVet } from "../../api/vets";
import { getSpecialties } from "../../api/specialties";
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
  specialties?: Specialty;
}

export async function loader() {
  try {
    return { specialties: await getSpecialties() };
  } catch {
    return { specialties: [] as Specialty[] };
  }
}

const rules = {
  required: true,
  minLength: 1,
  maxLength: 30,
  pattern: "^[a-zA-Z]*$",
};
const firstMessages = {
  maxlength: "First Name may be only 30 characters long",
  minlength: "First Name must be at least 1 characters long",
  pattern: "First Name may only consist of letters",
  required: "First name is required",
};
const lastMessages = {
  maxlength: "Last Name may be only 30 characters long",
  minlength: "Last Name must be at least 1 characters long",
  pattern: "Last Name may only consist of letters",
  required: "Last name is required",
};

export function Component() {
  const { specialties } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const methods = useForm<Values>({
    defaultValues: { firstName: "", lastName: "" },
  });
  const submit = methods.handleSubmit(async (values) => {
    await addVet({
      id: null,
      firstName: values.firstName,
      lastName: values.lastName,
      specialties: values.specialties ? [values.specialties] : [],
    } as unknown as Vet);
    navigate("/vets");
  });
  return (
    <PageContainer title="New Veterinarian">
      <Form methods={methods} id="vet" onSubmit={submit}>
        <div className="form-group" hidden>
          <input
            type="text"
            hidden
            className="form-control"
            id="id"
            name="id"
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
          requiredOnSubmit
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
          requiredOnSubmit
          maxLength={30}
        />
        <div className="control-group">
          <SelectField
            name="specialties"
            label="Type "
            id="specialties"
            options={specialties}
            hasFeedback={false}
          />
        </div>
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
