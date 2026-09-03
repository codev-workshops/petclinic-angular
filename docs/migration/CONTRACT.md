# REST contract (Angular → React)

Source of truth: the Angular services under `src/app/*/*.service.ts` and
`src/app/error.service.ts`. The React port lives in `src/services/api.ts`
(single axios instance `apiClient`) and `src/services/errorHandler.ts`.

- Base URL (both apps): `http://localhost:9966/petclinic/api/` — **with** trailing slash
  (`environment.REST_API_URL` / `REST_API_URL`). Paths below are relative to it and must
  not start with `/` (axios would otherwise drop the `/petclinic/api` prefix).
- All requests send `Content-Type: application/json`.
- Test/MSW base URL: `http://localhost:9966/petclinic/api` (`src/mocks/data.ts`).

## Error semantics

Angular: every call is piped through `catchError(handleError(operation, default))`
(`HttpErrorHandler`). The handler

1. builds `server returned code <status> with body "<body>"` (or `error.message` for
   non-HTTP errors),
2. overrides it with `JSON.parse(headers.get('errors'))[0].errorMessage` when the Spring
   `errors` header is present,
3. logs `<ServiceName>::<operation> failed: <message>` via `console.error`,
4. **re-throws the message** (`throwError(message)`), i.e. the `default` is recorded but
   never actually emitted — subscribers land in their error callback.

React (`createHandleError(serviceName)(operation, fallback)`): identical message
construction; the promise rejects with an `ApiError { message, status, serviceName,
operation, fallback, cause }`. `fallback` carries the Angular default so a caller can
choose to swallow-and-default (`error.fallback`) or surface `error.message`; components
must always show `message` in `<ErrorAlert>`.

Network failures (no response) map to `NETWORK_ERROR_MESSAGE`; unknown errors to
`GENERIC_ERROR_MESSAGE`.

## Endpoints

`204` responses have an empty body; the React functions resolve with `undefined` for
DELETE and with the (empty) body for PUT. Angular declared the PUT return types as the
entity but the backend answers `204 No Content`, so consumers must not read the PUT body.

### Owners — `OwnerService` → `getOwners`, `getOwnerById`, `searchOwners`, `addOwner`, `updateOwner`, `deleteOwner`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getOwners()` | GET | `owners` | – | `Owner[]` | `[]` |
| `getOwnerById(id)` | GET | `owners/{id}` | – | `Owner` (with `pets[]`, each with `visits[]`) | `{}` |
| `searchOwners(lastName)` | GET | `owners?lastName={lastName}` (`owners` when `lastName` is `undefined`) | – | `Owner[]` | `[]` |
| `addOwner(owner)` | POST | `owners` | `Owner` | `201 Owner` | `owner` |
| `updateOwner(id, owner)` | PUT | `owners/{id}` | `Owner` | `204` | `owner` |
| `deleteOwner(id)` | DELETE | `owners/{id}` | – | `204` | `[id]` |

### Pets — `PetService`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getPets()` | GET | `pets` | – | `Pet[]` | `[]` |
| `getPetById(id)` | GET | `pets/{id}` | – | `Pet` | `{}` |
| `addPet(pet)` | POST | `owners/{pet.owner.id}/pets` | `Pet` | `201 Pet` | `pet` |
| `updatePet(id, pet)` | PUT | `pets/{id}` | `Pet` | `204` | `pet` |
| `deletePet(id)` | DELETE | `pets/{id}` | – | `204` | `0` |

### Visits — `VisitService`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getVisits()` | GET | `visits` | – | `Visit[]` | `[]` |
| `getVisitById(id)` | GET | `visits/{id}` | – | `Visit` | `{}` |
| `addVisit(visit)` | POST | `owners/{visit.pet.ownerId}/pets/{visit.pet.id}/visits` | `Visit` | `201 Visit` | `visit` |
| `updateVisit(id, visit)` | PUT | `visits/{id}` | `Visit` | `204` | `visit` |
| `deleteVisit(id)` | DELETE | `visits/{id}` | – | `204` | `0` |

### Vets — `VetService`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getVets()` | GET | `vets` | – | `Vet[]` (with `specialties[]`) | `[]` |
| `getVetById(id)` | GET | `vets/{id}` | – | `Vet` | `{}` |
| `addVet(vet)` | POST | `vets` | `Vet` | `201 Vet` | `vet` |
| `updateVet(id, vet)` | PUT | `vets/{id}` | `Vet` | `204` | `vet` |
| `deleteVet(id)` | DELETE | `vets/{id}` | – | `204` | `0` |

### Pet types — `PetTypeService`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getPetTypes()` | GET | `pettypes` | – | `PetType[]` | `[]` |
| `getPetTypeById(id)` | GET | `pettypes/{id}` | – | `PetType` | `{}` |
| `addPetType(t)` | POST | `pettypes` | `PetType` | `201 PetType` | `t` |
| `updatePetType(id, t)` | PUT | `pettypes/{id}` | `PetType` | `204` | `t` |
| `deletePetType(id)` | DELETE | `pettypes/{id}` | – | `204` | `0` |

### Specialties — `SpecialtyService`

| Function | Verb | Path | Request body | Response | Angular default |
|---|---|---|---|---|---|
| `getSpecialties()` | GET | `specialties` | – | `Specialty[]` | `[]` |
| `getSpecialtyById(id)` | GET | `specialties/{id}` | – | `Specialty` | `{}` |
| `addSpecialty(s)` | POST | `specialties` | `Specialty` | `201 Specialty` | `s` |
| `updateSpecialty(id, s)` | PUT | `specialties/{id}` | `Specialty` | `204` | `s` |
| `deleteSpecialty(id)` | DELETE | `specialties/{id}` | – | `204` | `0` |

## Dates

`Pet.birthDate` and `Visit.date` travel as `YYYY-MM-DD` strings. Use
`formatApiDate` / `parseApiDate` (`src/utils/dates.ts`, date-fns with local-time
semantics). Never use `Date#toISOString()` — it shifts the day across the UTC boundary.

## TanStack Query

`src/services/queryClient.ts` exports the shared `queryClient` (retries off, no refetch
on window focus, `staleTime: 0` so lists refresh after mutations like the Angular pages);
`src/services/queryKeys.ts` exports the key factory (`queryKeys.owners.detail(id)`, …).

## MSW

`src/mocks/handlers.ts` covers every row above: success, `404` for unknown ids,
`201` for POST, `204` empty for PUT/DELETE, `owners?lastName=` filtering, plus
`networkError(method, path)` and `httpError(method, path, status, errorsHeader?)`
helpers for one-off `server.use(...)` overrides.
