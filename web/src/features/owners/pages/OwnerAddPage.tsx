import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { addOwner } from "../../../api";
import type { Owner } from "../../../api/types";
import {
  Form,
  FormField,
  PageContainer,
  SubmitButton,
} from "../../../components";

type OwnerFormValues = Omit<Owner, "id" | "pets"> & {
  id?: number | null;
  pets?: Owner["pets"];
};

const fields = {
  firstName: {
    required: true,
    minLength: 1,
    maxLength: 30,
    pattern: "^[a-zA-Z]*$",
  },
  lastName: {
    required: true,
    minLength: 1,
    maxLength: 30,
    pattern: "^[a-zA-Z]*$",
  },
  address: { required: true, maxLength: 255 },
  city: { required: true, maxLength: 80 },
  telephone: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: "^[0-9]*$",
  },
} as const;

export function Component() {
  const navigate = useNavigate();
  const methods = useForm<OwnerFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      telephone: "",
    },
  });

  const onSubmit = async (values: OwnerFormValues) => {
    await addOwner({ ...values, id: null } as unknown as Owner);
    navigate("/owners");
  };

  return (
    <PageContainer title="New Owner">
      <Form
        methods={methods}
        className="form-horizontal"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="form-group" hidden>
          <input
            type="text"
            hidden
            className="form-control"
            id="id"
            {...methods.register("id")}
          />
        </div>
        <FormField
          name="firstName"
          label="First Name"
          feedback="dirty"
          rules={fields.firstName}
          messages={{
            required: "First name is required",
            minlength: "First name must be at least 1 characters long",
            maxlength: "First name may be at most 30 characters long",
            pattern: "First name must consist of letters only",
          }}
        />
        <FormField
          name="lastName"
          label="Last Name"
          feedback="dirty"
          rules={fields.lastName}
          messages={{
            required: "Last name is required",
            minlength: "Last name must be at least 1 characters long",
            maxlength: "Last name may be at most 30 characters long",
            pattern: "Last name must consist of letters only",
          }}
        />
        <FormField
          name="address"
          label="Address"
          feedback="dirty"
          rules={fields.address}
          messages={{
            required: "Address is required",
            maxlength: "Address may be at most 255 characters long",
          }}
        />
        <FormField
          name="city"
          label="City"
          feedback="dirty"
          rules={fields.city}
          messages={{
            required: "City is required",
            maxlength: "City may be at most 80 characters long",
          }}
        />
        <FormField
          name="telephone"
          label="Telephone"
          feedback="dirty"
          rules={fields.telephone}
          messages={{
            required: "Phone number is required",
            maxlength: "Phone number cannot be more than 20 digits long",
            pattern: "Phone number only accept digits",
          }}
        />
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button
              type="button"
              className="btn btn-default"
              onClick={() => navigate("/owners")}
            >
              Back
            </button>{" "}
            <SubmitButton className="btn btn-default">Add Owner</SubmitButton>
          </div>
        </div>
      </Form>
    </PageContainer>
  );
}
