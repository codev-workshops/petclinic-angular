import { useEffect } from 'react';
import type { Specialty } from '../../../models';
import ErrorAlert from '../../../components/ErrorAlert';
import { getErrorMessage } from '../../../services/api';
import { useAddSpecialty } from '../hooks/useSpecialties';
import SpecialtyForm from './SpecialtyForm';
import styles from './SpecialtyAdd.module.css';

interface SpecialtyAddProps {
  onAdded: (specialty: Specialty) => void;
}

/**
 * Inline "New Specialty" panel toggled from the list page
 * (specialty-add.component; `specialties/add` is not routed in Angular).
 */
export default function SpecialtyAdd({ onAdded }: SpecialtyAddProps) {
  const addMutation = useAddSpecialty();
  const { reset } = addMutation;

  useEffect(() => () => reset(), [reset]);

  const handleSubmit = (specialty: Specialty) => {
    reset();
    addMutation.mutate(specialty, {
      onSuccess: (created) => onAdded(created),
    });
  };

  return (
    <section className={styles.panel} aria-labelledby="specialty-add-heading">
      <h2 id="specialty-add-heading">New Specialty</h2>
      <ErrorAlert message={addMutation.error ? getErrorMessage(addMutation.error) : null} onDismiss={reset} />
      <SpecialtyForm submitLabel="Save" isSubmitting={addMutation.isPending} onSubmit={handleSubmit} />
    </section>
  );
}
