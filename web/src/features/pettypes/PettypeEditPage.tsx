import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getPetTypeById, updatePetType } from "../../api/pettypes";
import type { PetType } from "../../api/types";
import { Form, FormField, PageContainer, SubmitButton } from "../../components";

interface Values extends Record<string, unknown> {
  name: string;
}

export async function loader({ params }: { params: { id?: string } }) {
  try {
    return await getPetTypeById(params.id ?? "");
  } catch {
    return { id: Number(params.id), name: "" } as PetType;
  }
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

export function Component() {
  const item = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const methods = useForm<Values>({ defaultValues: { name: item.name } });
  useEffect(() => {
    methods.reset({ name: item.name });
  }, [item.name, methods]);
  const submit = methods.handleSubmit(async (values) => {
    await updatePetType(item.id, { id: item.id, name: values.name });
    navigate("/pettypes");
  });
  return (
    <PageContainer title="Edit Pet Type">
      <Form methods={methods} id="pettype" onSubmit={submit}>
        <div className="form-group" hidden>
          <input
            type="text"
            hidden
            className="form-control"
            id="id"
            name="id"
            value={item.id}
            readOnly
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
          maxLength={80}
        />
        <SubmitButton>Update</SubmitButton>{" "}
        <button
          type="button"
          className="btn btn-default"
          onClick={() => navigate("/pettypes")}
        >
          Cancel
        </button>
      </Form>
    </PageContainer>
  );
}
