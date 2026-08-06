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
      "PetService",
      "getPets",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      { method: "GET", url: "pets/1" },
      "PetService",
      "getPetById",
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      { method: "POST", url: "owners/1/pets", data: pet },
      "PetService",
      "addPet",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      { method: "PUT", url: "pets/1", data: pet },
      "PetService",
      "updatePet",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      { method: "DELETE", url: "pets/1" },
      "PetService",
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
      "PetTypeService",
      "getPetTypes",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "pettypes/1" },
      "PetTypeService",
      "getPetTypeById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "pettypes", data: petType },
      "PetTypeService",
      "addPetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "pettypes/1", data: petType },
      "PetTypeService",
      "updatePetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "pettypes/1" },
      "PetTypeService",
      "deletePetType",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "specialties" },
      "SpecialtyService",
      "getSpecialties",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "specialties/1" },
      "SpecialtyService",
      "getSpecialtyById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "specialties", data: specialty },
      "SpecialtyService",
      "addSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "specialties/1", data: specialty },
      "SpecialtyService",
      "updateSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "specialties/1" },
      "SpecialtyService",
      "deleteSpecialty",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "vets" },
      "VetService",
      "getVets",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "GET", url: "vets/1" },
      "VetService",
      "getVetById",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "POST", url: "vets", data: vet },
      "VetService",
      "addVet",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "PUT", url: "vets/1", data: vet },
      "VetService",
      "updateVet",
    );
    expect(request).toHaveBeenCalledWith(
      { method: "DELETE", url: "vets/1" },
      "VetService",
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
      "VisitService",
      "getVisits",
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      { method: "GET", url: "visits/1" },
      "VisitService",
      "getVisitById",
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      { method: "POST", url: "owners/1/pets/1/visits", data: visit },
      "VisitService",
      "addVisit",
    );
    expect(request).toHaveBeenNthCalledWith(
      4,
      { method: "PUT", url: "visits/1", data: visit },
      "VisitService",
      "updateVisit",
    );
    expect(request).toHaveBeenNthCalledWith(
      5,
      { method: "DELETE", url: "visits/1" },
      "VisitService",
      "deleteVisit",
    );
  });
});
