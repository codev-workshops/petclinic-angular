import { http, HttpResponse } from 'msw';
import type { HttpHandler, JsonBodyType } from 'msw';
import { API_BASE_URL, makeOwners, makePetTypes, makePets, makeSpecialties, makeVets, makeVisits } from './data';

/** Absolute URL for an API path, e.g. `apiUrl('owners/1')`. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`;
}

interface WithId {
  id: number;
}

function json(body: unknown, status = 200) {
  return HttpResponse.json(body as JsonBodyType, { status });
}

function notFound() {
  return new HttpResponse(null, { status: 404 });
}

function noContent() {
  return new HttpResponse(null, { status: 204 });
}

/**
 * Standard CRUD handler set for a collection resource (`GET/POST <name>`,
 * `GET/PUT/DELETE <name>/:id`). Unknown ids answer 404; DELETE answers 204 with no body.
 */
function crudHandlers<T extends WithId>(name: string, fixtures: () => T[]): HttpHandler[] {
  const find = (id: string) => fixtures().find((item) => String(item.id) === id);
  return [
    http.get(apiUrl(name), () => json(fixtures())),
    http.get(apiUrl(`${name}/:id`), ({ params }) => {
      const item = find(String(params.id));
      return item ? json(item) : notFound();
    }),
    http.post(apiUrl(name), async ({ request }) => {
      const body = (await request.json()) as T;
      return json({ ...body, id: body.id || 999 }, 201);
    }),
    // spring-petclinic-rest answers PUT with 204 No Content.
    http.put(apiUrl(`${name}/:id`), async ({ params, request }) => {
      if (!find(String(params.id))) {
        return notFound();
      }
      await request.json();
      return noContent();
    }),
    http.delete(apiUrl(`${name}/:id`), ({ params }) => {
      return find(String(params.id)) ? noContent() : notFound();
    }),
  ];
}

export const ownerHandlers: HttpHandler[] = [
  http.get(apiUrl('owners'), ({ request }) => {
    const lastName = new URL(request.url).searchParams.get('lastName');
    const owners = makeOwners();
    if (lastName === null || lastName === '') {
      return json(owners);
    }
    return json(owners.filter((owner) => owner.lastName.toLowerCase().startsWith(lastName.toLowerCase())));
  }),
  ...crudHandlers('owners', makeOwners).slice(1),
  // POST owners/:ownerId/pets (PetService.addPet)
  http.post(apiUrl('owners/:ownerId/pets'), async ({ params, request }) => {
    if (!makeOwners().some((owner) => String(owner.id) === String(params.ownerId))) {
      return notFound();
    }
    const body = (await request.json()) as Record<string, unknown>;
    return json({ ...body, id: body.id || 999, ownerId: Number(params.ownerId) }, 201);
  }),
  // POST owners/:ownerId/pets/:petId/visits (VisitService.addVisit)
  http.post(apiUrl('owners/:ownerId/pets/:petId/visits'), async ({ params, request }) => {
    const petExists = makePets().some(
      (pet) => String(pet.id) === String(params.petId) && String(pet.ownerId) === String(params.ownerId),
    );
    if (!petExists) {
      return notFound();
    }
    const body = (await request.json()) as Record<string, unknown>;
    return json({ ...body, id: body.id || 999, petId: Number(params.petId) }, 201);
  }),
];

export const petHandlers: HttpHandler[] = crudHandlers('pets', makePets);
export const visitHandlers: HttpHandler[] = crudHandlers('visits', makeVisits);
export const vetHandlers: HttpHandler[] = crudHandlers('vets', makeVets);
export const petTypeHandlers: HttpHandler[] = crudHandlers('pettypes', makePetTypes);
export const specialtyHandlers: HttpHandler[] = crudHandlers('specialties', makeSpecialties);

export const handlers: HttpHandler[] = [
  ...ownerHandlers,
  ...petHandlers,
  ...visitHandlers,
  ...vetHandlers,
  ...petTypeHandlers,
  ...specialtyHandlers,
];

type Method = 'get' | 'post' | 'put' | 'delete';

/** One-off handler that fails with a network error, e.g. `server.use(networkError('get', 'owners'))`. */
export function networkError(method: Method, path: string): HttpHandler {
  return http[method](apiUrl(path), () => HttpResponse.error());
}

/** One-off handler returning an HTTP error, optionally with a Spring `errors` header. */
export function httpError(method: Method, path: string, status: number, errorsHeader?: string): HttpHandler {
  return http[method](apiUrl(path), () => {
    const headers = errorsHeader ? { errors: errorsHeader } : undefined;
    return new HttpResponse(`error ${status}`, { status, headers });
  });
}
