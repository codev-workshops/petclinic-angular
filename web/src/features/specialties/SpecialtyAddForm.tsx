import { useForm } from "react-hook-form";
import { addSpecialty } from "../../api/specialties";
import type { Specialty } from "../../api/types";
import { Form, FormField, PageContainer, SubmitButton } from "../../components";

interface Values extends Record<string, unknown> {
  name: string;
}

export interface SpecialtyAddFormProps {
  onNewSpecialty?: (specialty: Specialty) => void;
}

const rules = {
  required: true,
  minLength: 1,
  maxLength: 80,
  pattern: "^[A-Za-z0-9].{0,79}$",
};
const messages = {
  maxlength: "Name may be only 80 characters long",
  minlength: "Name must be at least 1 characters long",
  pattern: "Name must begin with a letter or digit",
  required: "Name is required",
};

export function SpecialtyAddForm({ onNewSpecialty }: SpecialtyAddFormProps) {
  const methods = useForm<Values>({ defaultValues: { name: "" } });
  const submit = methods.handleSubmit(async (values) => {
    const created = await addSpecialty({
      id: null,
      name: values.name,
    } as unknown as Specialty);
    onNewSpecialty?.(created);
  });
  return (
    <PageContainer title="New Specialty">
      <Form methods={methods} onSubmit={submit}>
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
          name="name"
          label="Name"
          labelClassName="col-sm-1 control-label"
          controlClassName="col-sm-6"
          rules={rules}
          messages={messages}
          feedback="dirty"
          requiredOnSubmit
          maxLength={80}
        />
        <SubmitButton>Save</SubmitButton>
      </Form>
    </PageContainer>
  );
}
