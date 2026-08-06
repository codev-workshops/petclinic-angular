import angularImage from "../../../src/assets/images/angular.png";
import pivotalImage from "../../../src/assets/images/spring-pivotal-logo.png";

export function Footer() {
  return (
    <>
      <br />
      <br />
      <div className="container footer-wrapper">
        <div className="row">
          <div className="col-12 text-center">
            <img src={angularImage} alt="Angular" height="80" width="80" />
            <img src={pivotalImage} alt="Sponsored by Pivotal" />
          </div>
        </div>
      </div>
    </>
  );
}
