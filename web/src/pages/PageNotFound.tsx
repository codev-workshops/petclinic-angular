import petsImage from "../../assets/images/pets.png";

export function PageNotFound() {
  return (
    <>
      <h1>Oops! Page not found !</h1>
      <div className="container-fluid">
        <div className="container xd-container">
          <h2>Not Found - 404 error</h2>
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
