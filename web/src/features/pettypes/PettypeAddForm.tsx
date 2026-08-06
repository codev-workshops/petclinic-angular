import { useForm } from "react-hook-form";
import { addPetType } from "../../api/pettypes";
import type { PetType } from "../../api/types";
import { Form, FormField, PageContainer, SubmitButton } from "../../components";

interface Values extends Record<string, unknown> {
  name: string;
}

export interface PettypeAddFormProps {
  onNewPetType?: (petType: PetType) => void;
}

const rules = {
  required: true,
  minLength: 1,
  maxLength: 80,
  pattern: "^[A-Za-z0-9].{0,79}$",
};
const messages = {
  maxlength: "Name may be only 80 characters long",
  minlength: "Name may be at least 1 characters long",
  pattern: "Name must begin with a letter or digit",
  required: "Name is required",
};

export function PettypeAddForm({ onNewPetType }: PettypeAddFormProps) {
  const methods = useForm<Values>({ defaultValues: { name: "" } });
  const submit = methods.handleSubmit(async (values) => {
    const created = await addPetType({
      id: null,
      name: values.name,
    } as unknown as PetType);
    onNewPetType?.(created);
  });
  return (
    <PageContainer title="New Pet Type">
      <Form methods={methods} id="pettype" onSubmit={submit}>
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
