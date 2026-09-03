// Plain TypeScript interfaces mirroring the Angular models field-for-field
// (src/app/**/{owner,pet,visit,vet,pettype,specialty}.ts). Kept in a single
// dependency-free module tree so the Angular Owner <-> Pet <-> Visit import
// cycle becomes a set of type-only references.
export type { Owner } from './Owner';
export type { Pet } from './Pet';
export type { Visit } from './Visit';
export type { Vet } from './Vet';
export type { PetType } from './PetType';
export type { Specialty } from './Specialty';

/** Route params arrive as strings while payloads carry numbers; API functions accept both. */
export type EntityId = number | string;
