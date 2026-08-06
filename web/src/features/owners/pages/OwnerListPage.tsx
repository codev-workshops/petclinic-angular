import { useState, type FormEvent } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { getOwners, searchOwners } from "../../../api";
import type { Owner } from "../../../api/types";
import { PageContainer } from "../../../components";
import type { OwnersLoaderData } from "../loaders";

export function Component() {
  const { owners: loadedOwners } = useLoaderData() as OwnersLoaderData;
  const [owners, setOwners] = useState<Owner[] | null>(loadedOwners);
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setOwners(
        lastName === "" ? await getOwners() : await searchOwners(lastName),
      );
    } catch {
      setOwners(null);
    }
  };

  return (
    <PageContainer title="Owners">
      <form
        method="get"
        className="form-horizontal"
        id="search-owner-form"
        onSubmit={submitSearch}
      >
        <div className="form-group">
          <div className="control-group" id="lastNameGroup">
            <label className="col-sm-2 control-label">Last name </label>
            <div className="col-sm-10">
              <input
                className="form-control"
                size={30}
                maxLength={80}
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
              <span className="help-inline"></span>
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button type="submit" className="btn btn-default">
              Find Owner
            </button>
          </div>
        </div>
      </form>

      {owners == null ? (
        <div>No owners with LastName starting with "{lastName}"</div>
      ) : (
        <div className="table-responsive" id="ownersTable">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Telephone</th>
                <th>Pets</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id}>
                  <td className="ownerFullName">
                    <Link to={`/owners/${owner.id}`}>
                      {owner.firstName} {owner.lastName}
                    </Link>
                  </td>
                  <td>{owner.address}</td>
                  <td>{owner.city}</td>
                  <td>{owner.telephone}</td>
                  <td>{(owner.pets ?? []).map((pet) => pet.name).join(" ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button
              type="button"
              className="btn btn-default"
              onClick={() => navigate("/owners/add")}
            >
              Add Owner
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
