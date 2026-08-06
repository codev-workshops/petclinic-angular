import { beforeEach, describe, expect, it, vi } from "vitest";
import { request } from "./client";
import {
  addOwner,
  deleteOwner,
  getOwnerById,
  getOwners,
  searchOwners,
  updateOwner,
} from "./owners";
import { addPet, deletePet, getPetById, getPets, updatePet } from "./pets";
import {
  addPetType,
  deletePetType,
  getPetTypeById,
  getPetTypes,
  updatePetType,
} from "./pettypes";
import {
  addSpecialty,
  deleteSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
} from "./specialties";
import { addVet, deleteVet, getVetById, getVets, updateVet } from "./vets";
import {
  addVisit,
  deleteVisit,
  getVisitById,
  getVisits,
  updateVisit,
} from "./visits";

vi.mock("./client", () => ({ request: vi.fn().mockResolvedValue(undefined) }));

const owner = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  address: "",
  city: "",
  telephone: "",
  pets: [],
};
const pet = {
  id: 1,
  ownerId: 1,
  name: "Leo",
  birthDate: "2020-01-15",
  type: { id: 1, name: "cat" },
  owner,
  visits: [],
};
const petType = { id: 1, name: "cat" };
const specialty = { id: 1, name: "radiology" };
const vet = {
  id: 1,
  firstName: "James",
  lastName: "Carter",
  specialties: [specialty],
};
const visit = { id: 1, date: "2024-01-20", description: "Checkup", pet };

describe("API service wrappers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the owners endpoint paths and operations", async () => {
    await getOwners();
    await getOwnerById(1);
    await addOwner(owner);
    await updateOwner(1, owner);
    await deleteOwner(1);
    await searchOwners("Smi");
    await searchOwners();

    expect(request).toHaveBeenNthCalledWith(
      1,
      { method: "GET", url: "owners" },
      "OwnerService",
      "getOwners",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      { method: "GET", url: "owners/1" },
      "OwnerService",
      "getOwnerById",
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      { method: "POST", url: "owners", data: owner },
      "OwnerService",
      "addOwner",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      { method: "PUT", url: "owners/1", data: owner },
      "OwnerService",
      "updateOwner",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      { method: "DELETE", url: "owners/1" },
      "OwnerService",
      "deleteOwner",
    );
    expect(request).toHaveBeenNthCalledWith(
      6,
      { method: "GET", url: "owners?lastName=Smi" },
      "OwnerService",
      "searchOwners",
    );
    expect(request).toHaveBeenNthCalledWith(
      7,
      { method: "GET", url: "owners" },
      "OwnerService",
      "searchOwners",
    );
  });

  it("uses the pets and nested pet endpoint paths", async () => {
    await getPets();
    await getPetById(1);
    await addPet(pet);
    await updatePet(1, pet);
    await deletePet(1);

    expect(request).toHaveBeenNthCalledWith(
      1,
      { method: "GET", url: "pets" },
      "OwnerService",
      "getPets",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      { method: "GET", url: "pets/1" },
      "OwnerService",
      "getPetById",
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      { method: "POST", url: "owners/1/pets", data: pet },
      "OwnerService",
      "addPet",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      { method: "PUT", url: "pets/1", data: pet },
      "OwnerService",
      "updatePet",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      { method: "DELETE", url: "pets/1" },
      "OwnerService",
      "deletePet",
    );
  });

  it("uses pet type, specialty, and vet endpoint paths", async () => {
    await getPetTypes();
    await getPetTypeById(1);
    await addPetType(petType);
    await updatePetType(1, petType);
    await deletePetType(1);
    await getSpecialties();
    await getSpecialtyById(1);
    await addSpecialty(specialty);
    await updateSpecialty(1, specialty);
    await deleteSpecialty(1);
    await getVets();
    await getVetById(1);
    await addVet(vet);
    await updateVet(1, vet);
    await deleteVet(1);

    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "pettypes" },
      "OwnerService",
      "getPetTypes",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "pettypes/1" },
      "OwnerService",
      "getPetTypeById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "pettypes", data: petType },
      "OwnerService",
      "addPetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "pettypes/1", data: petType },
      "OwnerService",
      "updatePetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "pettypes/1" },
      "OwnerService",
      "deletePetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "specialties" },
      "OwnerService",
      "getSpecialties",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "specialties/1" },
      "OwnerService",
      "getSpecialtyById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "specialties", data: specialty },
      "OwnerService",
      "addSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "specialties/1", data: specialty },
      "OwnerService",
      "updateSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "specialties/1" },
      "OwnerService",
      "deleteSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "vets" },
      "OwnerService",
      "getVets",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "vets/1" },
      "OwnerService",
      "getVetById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "vets", data: vet },
      "OwnerService",
      "addVet",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "vets/1", data: vet },
      "OwnerService",
      "updateVet",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "vets/1" },
      "OwnerService",
      "deleteVet",
    );
  });

  it("uses visit list, nested add, update, and delete paths", async () => {
    await getVisits();
    await getVisitById(1);
    await addVisit(visit);
    await updateVisit(1, visit);
    await deleteVisit(1);

    expect(request).toHaveBeenNthCalledWith(
      1,
      { method: "GET", url: "visits" },
      "OwnerService",
      "getVisits",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      { method: "GET", url: "visits/1" },
      "OwnerService",
      "getVisitById",
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      { method: "POST", url: "owners/1/pets/1/visits", data: visit },
      "OwnerService",
      "addVisit",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      { method: "PUT", url: "visits/1", data: visit },
      "OwnerService",
      "updateVisit",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      { method: "DELETE", url: "visits/1" },
      "OwnerService",
      "deleteVisit",
    );
  });
});
