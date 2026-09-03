import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import springLogo from '../assets/images/spring-pivotal-logo.png';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <>
      <NavBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <img src={springLogo} alt="Sponsored by Pivotal" />
      </footer>
    </>
  );
}
