import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, GraduationCap, Heart, Home, List, Plus, Search, User } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './NavBar.module.css';

type Menu = 'owners' | 'vets';

const ICON_SIZE = 16;

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
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cx(styles.link, isActive && 'active', isActive && styles.active);

  return (
    <nav className={cx(styles.navbar, 'navbar')} role="navigation" aria-label="Main" ref={navRef}>
      <Link className={styles.brand} to="/" aria-label="Spring Petclinic">
        <span className={styles.brandHover}></span>
      </Link>

      <ul className={styles.nav}>
        <li className={styles.item}>
          <Link className={styles.link} to="/welcome" title="home page">
            <Home size={ICON_SIZE} aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>

        <li className={cx(styles.item, 'dropdown', openMenu === 'owners' && styles.open)}>
          <button
            type="button"
            className={cx(styles.toggle, 'dropdown-toggle')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'owners'}
            onClick={() => toggle('owners')}
          >
            <User size={ICON_SIZE} aria-hidden="true" />
            <span>Owners</span>
            <ChevronDown size={ICON_SIZE} aria-hidden="true" />
          </button>
          <ul className={styles.menu}>
            <li>
              <Link className={styles.menuLink} to="/owners" onClick={closeMenu}>
                <Search size={ICON_SIZE} aria-hidden="true" />
                <span>Search</span>
              </Link>
            </li>
            <li>
              <Link className={styles.menuLink} to="/owners/add" onClick={closeMenu}>
                <Plus size={ICON_SIZE} aria-hidden="true" />
                <span>Add New</span>
              </Link>
            </li>
          </ul>
        </li>

        <li className={cx(styles.item, 'dropdown', openMenu === 'vets' && styles.open)}>
          <button
            type="button"
            className={cx(styles.toggle, 'dropdown-toggle')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'vets'}
            onClick={() => toggle('vets')}
          >
            <GraduationCap size={ICON_SIZE} aria-hidden="true" />
            <span>Veterinarians</span>
            <ChevronDown size={ICON_SIZE} aria-hidden="true" />
          </button>
          <ul className={styles.menu}>
            <li>
              <Link className={styles.menuLink} to="/vets" onClick={closeMenu}>
                <Search size={ICON_SIZE} aria-hidden="true" />
                <span>All</span>
              </Link>
            </li>
            <li>
              <Link className={styles.menuLink} to="/vets/add" onClick={closeMenu}>
                <Plus size={ICON_SIZE} aria-hidden="true" />
                <span>Add New</span>
              </Link>
            </li>
          </ul>
        </li>

        <li className={styles.item}>
          <NavLink to="/pettypes" title="pettypes" className={navLinkClass}>
            <Heart size={ICON_SIZE} aria-hidden="true" />
            <span>Pet Types</span>
          </NavLink>
        </li>
        <li className={styles.item}>
          <NavLink to="/specialties" title="specialties" className={navLinkClass}>
            <List size={ICON_SIZE} aria-hidden="true" />
            <span>Specialties</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
