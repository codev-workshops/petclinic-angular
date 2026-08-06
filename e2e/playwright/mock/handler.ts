import { hydrate, nextId, Store } from './store';

type Reply = { status: number; headers?: Record<string, string>; body?: unknown };
const jsonHeaders = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
const ok = (body: unknown): Reply => ({ status: 200, headers: jsonHeaders, body });
const created = (body: unknown): Reply => ({ status: 201, headers: jsonHeaders, body });
const notFound = (body = 'Not found'): Reply => ({ status: 404, headers: jsonHeaders, body });
const error = (status: number, body: unknown, headers?: Record<string, string>): Reply => ({ status, headers: { ...jsonHeaders, ...headers }, body });

export function handleApi(method: string, pathAfterApiBase: string, query: URLSearchParams, bodyJson: any, store: Store): Reply {
  hydrate(store);
  const parts = pathAfterApiBase.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const [resource, idText, action, action2] = parts;
  const id = idText ? Number(idText) : undefined;
  if (!resource) return notFound();
  if (method === 'GET') {
    if (resource === 'owners' && !id) {
      const lastName = query.get('lastName');
      const owners = lastName ? store.owners.filter((owner) => owner.lastName.toLowerCase().startsWith(lastName.toLowerCase())) : store.owners;
      return owners.length || !lastName ? ok(owners) : notFound();
    }
    if (resource === 'owners' && id) return store.owners.find((owner) => owner.id === id) ? ok(store.owners.find((owner) => owner.id === id)) : notFound();
    if (resource === 'pets' && !id) return ok(store.pets);
    if (resource === 'pets' && id) return store.pets.find((pet) => pet.id === id) ? ok(store.pets.find((pet) => pet.id === id)) : notFound();
    if (resource === 'pettypes' && !id) return ok(store.pettypes);
    if (resource === 'pettypes' && id) return store.pettypes.find((item) => item.id === id) ? ok(store.pettypes.find((item) => item.id === id)) : notFound();
    if (resource === 'specialties' && !id) return ok(store.specialties);
    if (resource === 'specialties' && id) return store.specialties.find((item) => item.id === id) ? ok(store.specialties.find((item) => item.id === id)) : notFound();
    if (resource === 'vets' && !id) return ok(store.vets);
    if (resource === 'vets' && id) return store.vets.find((vet) => vet.id === id) ? ok(store.vets.find((vet) => vet.id === id)) : notFound();
    if (resource === 'visits' && !id) return ok(store.visits);
    if (resource === 'visits' && id) return store.visits.find((visit) => visit.id === id) ? ok(store.visits.find((visit) => visit.id === id)) : notFound();
    return notFound();
  }
  if (method === 'POST') {
    if (resource === 'owners' && !id) {
      const owner = { ...bodyJson, id: nextId(store.owners), pets: [] }; store.owners.push(owner); return created(owner);
    }
    if (resource === 'owners' && idText && action === 'pets' && action2 && parts.length === 5 && parts[4] === 'visits') {
      const visit = { ...bodyJson, id: nextId(store.visits), petId: Number(action2) }; store.visits.push(visit); return created(visit);
    }
    if (resource === 'owners' && idText && action === 'pets' && parts.length === 3) {
      const pet = { ...bodyJson, id: nextId(store.pets), ownerId: id, visits: [], type: bodyJson.type || store.pettypes[0] }; store.pets.push(pet); return created(pet);
    }
    if (resource === 'pettypes') { const item = { ...bodyJson, id: nextId(store.pettypes) }; store.pettypes.push(item); return created(item); }
    if (resource === 'specialties') { const item = { ...bodyJson, id: nextId(store.specialties) }; store.specialties.push(item); return created(item); }
    if (resource === 'vets') { const vet = { ...bodyJson, id: nextId(store.vets), specialties: bodyJson.specialties || [] }; store.vets.push(vet); return created(vet); }
    return notFound();
  }
  if (method === 'PUT') {
    if (!id) return notFound();
    const collection = resource === 'owners' ? store.owners : resource === 'pets' ? store.pets : resource === 'pettypes' ? store.pettypes : resource === 'specialties' ? store.specialties : resource === 'vets' ? store.vets : resource === 'visits' ? store.visits : [];
    const index = collection.findIndex((item) => item.id === id);
    if (index < 0) return notFound();
    collection[index] = { ...collection[index], ...bodyJson, id } as never;
    return ok(collection[index]);
  }
  if (method === 'DELETE') {
    if (!id) return notFound();
    const key = resource === 'owners' ? 'owners' : resource === 'pets' ? 'pets' : resource === 'pettypes' ? 'pettypes' : resource === 'specialties' ? 'specialties' : resource === 'vets' ? 'vets' : 'visits';
    const collection = store[key] as Array<{ id: number }>;
    const index = collection.findIndex((item) => item.id === id);
    if (index < 0) return notFound();
    collection.splice(index, 1);
    if (key === 'pets') store.visits = store.visits.filter((visit) => visit.petId !== id);
    if (key === 'owners') store.pets = store.pets.filter((pet) => pet.ownerId !== id);
    return ok(id);
  }
  return error(405, 'Method not allowed');
}
