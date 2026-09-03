import Page from '../../components/ui/Page';
import petsLogo from '../../assets/images/pets.png';
import styles from './Welcome.module.css';

export default function Welcome() {
  return (
    <>
      <h1 className={styles.title}>Welcome to Petclinic</h1>
      <Page>
        <h2>Welcome</h2>
        <img className={styles.logo} src={petsLogo} alt="pets logo" />
      </Page>
    </>
  );
}
