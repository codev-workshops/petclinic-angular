# Model mapping (Angular → React)

React models are plain TypeScript interfaces in `src/models/*.ts`, re-exported type-only
from the dependency-free barrel `src/models/index.ts`. Field names, types and optionality
match the Angular interfaces one-for-one; the Angular `Owner → Pet → Visit → Pet` import
cycle is harmless because every cross-reference is `import type`.

| Angular file | React file | Fields (identical on both sides) |
|---|---|---|
| `src/app/owners/owner.ts` | `src/models/Owner.ts` | `id: number`, `firstName: string`, `lastName: string`, `address: string`, `city: string`, `telephone: string`, `pets: Pet[]` |
| `src/app/pets/pet.ts` | `src/models/Pet.ts` | `id: number`, `ownerId: number`, `name: string`, `birthDate: string` (`YYYY-MM-DD`), `type: PetType`, `owner: Owner`, `visits: Visit[]` |
| `src/app/visits/visit.ts` | `src/models/Visit.ts` | `id: number`, `date: string` (`YYYY-MM-DD`), `description: string`, `pet: Pet`, `petId?: number` |
| `src/app/vets/vet.ts` | `src/models/Vet.ts` | `id: number`, `firstName: string`, `lastName: string`, `specialties: Specialty[]` |
| `src/app/pettypes/pettype.ts` | `src/models/PetType.ts` | `id: number`, `name: string` |
| `src/app/specialties/specialty.ts` | `src/models/Specialty.ts` | `id: number`, `name: string` |

Additional React-only helper type: `EntityId = number | string` (route params are strings,
payload ids are numbers; every `api.ts` function accepts both, exactly like the Angular
services which accept `string` ids).

## Notes for feature waves

- The REST backend (spring-petclinic-rest) does **not** return the back-references
  `Pet.owner` and `Visit.pet`; it returns `Pet.ownerId` and `Visit.petId`. The Angular
  components populate `pet.owner` / `visit.pet` client-side before calling `addPet` /
  `addVisit` (the service reads the ids from those nested objects). The MSW fixtures in
  `src/mocks/data.ts` mirror the real payloads (no back-references).
- `Pet.birthDate` / `Visit.date`: use `formatApiDate(date)` and `parseApiDate(string)` from
  `src/utils/dates.ts`. Angular formats with `moment(...).format('YYYY-MM-DD')` /
  the `Date` pipe in local time; the React helpers use `date-fns` `format`/`parse` (local).
- Angular pages build "new" entities as `{} as Owner` etc. and rely on template binding.
  In React use fully-typed initial state (empty strings, `0` ids) instead of partial casts.
