import { describe, expect, it } from 'vitest';
import { fieldIssues, ownerSchema, petTypeNameSchema, vetNameSchema } from '../schemas';

describe('forms/schemas', () => {
  it('reports only `required` on an empty value (Angular validator semantics)', () => {
    expect(fieldIssues(ownerSchema.shape.firstName, '')).toEqual([
      { kind: 'required', message: 'First name is required' },
    ]);
  });

  it('reports every failing rule in template order', () => {
    const longDigits = '1'.repeat(31);
    expect(fieldIssues(ownerSchema.shape.firstName, longDigits).map((issue) => issue.kind)).toEqual([
      'maxlength',
      'pattern',
    ]);
    expect(fieldIssues(vetNameSchema('First Name', 'First name'), longDigits).map((issue) => issue.message)).toEqual([
      'First Name may be only 30 characters long',
      'First Name may only consist of letters',
    ]);
  });

  it('uses anchored patterns and exact messages', () => {
    expect(fieldIssues(petTypeNameSchema, '-dog')).toEqual([
      { kind: 'pattern', message: 'Name must begin with a letter or digit' },
    ]);
    expect(fieldIssues(petTypeNameSchema, 'dog')).toEqual([]);
    expect(
      ownerSchema.safeParse({ firstName: 'A', lastName: 'B', address: 'x', city: 'y', telephone: '1' }).success,
    ).toBe(true);
  });
});
