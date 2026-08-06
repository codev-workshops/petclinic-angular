import petsImage from "../../assets/images/pets.png";

export function Welcome() {
  return (
    <>
      <h1 className="title">Welcome to Petclinic</h1>
      <div className="container-fluid">
        <div className="container xd-container">
          <h2>Welcome</h2>
          <div className="row">
            <div className="col-md-12">
              <img className="img-responsive" src={petsImage} alt="pets logo" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
