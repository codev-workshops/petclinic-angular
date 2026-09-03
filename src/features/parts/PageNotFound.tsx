import Page from '../../components/ui/Page';
import petsLogo from '../../assets/images/pets.png';
import styles from './Welcome.module.css';

/** Port of src/app/parts/page-not-found/page-not-found.component.html */
export default function PageNotFound() {
  return (
    <>
      <h1 className={styles.title}>Oops! Page not found !</h1>
      <Page>
        <h2>Not Found - 404 error</h2>
        <img className={styles.logo} src={petsLogo} alt="pets logo" />
      </Page>
    </>
  );
}
