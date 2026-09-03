import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './NavBar.css';

type Menu = 'owners' | 'vets';

/**
 * Port of the navigation bar in src/app/app.component.html (Bootstrap 3 navbar).
 * The two dropdowns replace the jQuery `data-toggle="dropdown"` behaviour with
 * React state; links keep the exact Angular targets.
 */
export default function NavBar() {
  const [openMenu, setOpenMenu] = useState<Menu | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeMenu = () => setOpenMenu(null);

  useEffect(() => {
    if (!openMenu) {
      return;
    }
    const onDocumentClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [openMenu]);

  const toggle = (menu: Menu) => setOpenMenu((current) => (current === menu ? null : menu));

  return (
    <div className="container-fluid main-wrapper">
      <nav className="navbar navbar-default" role="navigation" ref={navRef}>
        <div className="container-fluid">
          <div className="navbar-header">
            <Link className="navbar-brand" to="/">
              <span></span>
            </Link>
          </div>

          <ul className="nav navbar-nav">
            <li>
              <Link to="/welcome" title="home page">
                <span className="glyphicon glyphicon-home" aria-hidden="true"></span>
                <span> Home</span>
              </Link>
            </li>

            <li className={`dropdown${openMenu === 'owners' ? ' open' : ''}`}>
              <button
                type="button"
                className="dropdown-toggle btn-link"
                aria-haspopup="true"
                aria-expanded={openMenu === 'owners'}
                onClick={() => toggle('owners')}
              >
                <span className="glyphicon glyphicon-user" aria-hidden="true"></span> Owners
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/owners" onClick={closeMenu}>
                    <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
                    <span> Search</span>
                  </Link>
                </li>
                <li>
                  <Link to="/owners/add" onClick={closeMenu}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    <span> Add New</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className={`dropdown${openMenu === 'vets' ? ' open' : ''}`}>
              <button
                type="button"
                className="dropdown-toggle btn-link"
                aria-haspopup="true"
                aria-expanded={openMenu === 'vets'}
                onClick={() => toggle('vets')}
              >
                <span className="glyphicon glyphicon-education" aria-hidden="true"></span> Veterinarians
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/vets" onClick={closeMenu}>
                    <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
                    <span> All</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vets/add" onClick={closeMenu}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    <span> Add New</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <NavLink to="/pettypes" title="pettypes" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="glyphicon glyphicon-heart" aria-hidden="true"></span>
                <span> Pet Types</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/specialties"
                title="specialties"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="glyphicon glyphicon-th-list" aria-hidden="true"></span>
                <span> Specialties</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
