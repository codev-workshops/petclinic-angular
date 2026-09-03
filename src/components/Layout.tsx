import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import angularLogo from '../assets/images/angular.png';
import springLogo from '../assets/images/spring-pivotal-logo.png';
import './Layout.css';

/** Port of src/app/app.component.html: navbar, router outlet and footer. */
export default function Layout() {
  return (
    <>
      <NavBar />

      <div className="content-wrapper">
        <Outlet />
      </div>

      <br />
      <br />
      <div className="container footer-wrapper">
        <div className="row">
          <div className="col-12 text-center">
            <img src={angularLogo} alt="Angular" height="80" width="80" />
            <img src={springLogo} alt="Sponsored by Pivotal" />
          </div>
        </div>
      </div>
    </>
  );
}
