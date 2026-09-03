import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';
import { fieldIssues, vetNameSchema } from '../../../forms/schemas';

export interface VetNameFieldProps {
  id: 'firstName' | 'lastName';
  label: string;
  /** vet-add says "First name is required", vet-edit "First Name is required". */
  requiredLabel: string;
  value: string;
  dirty: boolean;
  /** Whether a `required` failure is shown (vet-add also shows it after a submit attempt). */
  showRequired: boolean;
  onChange: (value: string) => void;
}

export default function VetNameField({
  id,
  label,
  requiredLabel,
  value,
  dirty,
  showRequired,
  onChange,
}: VetNameFieldProps) {
  const issues = fieldIssues(vetNameSchema(label, requiredLabel), value);
  const isValid = issues.length === 0;
  const hasVisibleError = dirty && !isValid;

  const messages = issues
    .filter((issue) => (issue.kind === 'required' ? showRequired : dirty))
    .map((issue) => issue.message);

  return (
    <Field
      id={id}
      label={label}
      status={dirty ? (isValid ? 'valid' : 'invalid') : null}
      errorsId={`${id}-errors`}
      errors={messages}
    >
      <Input
        type="text"
        id={id}
        name={id}
        value={value}
        required
        aria-invalid={hasVisibleError || showRequired ? true : undefined}
        aria-describedby={`${id}-errors`}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
