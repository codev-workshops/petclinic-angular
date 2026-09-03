import petsLogo from '../../assets/images/pets.png';

/** Port of src/app/parts/welcome/welcome.component.html */
export default function Welcome() {
  return (
    <>
      <h1 className="title">Welcome to Petclinic</h1>

      <div className="container-fluid">
        <div className="container xd-container">
          <h2>Welcome</h2>
          <div className="row">
            <div className="col-md-12">
              <img className="img-responsive" src={petsLogo} alt="pets logo" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
