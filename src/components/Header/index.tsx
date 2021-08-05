import styles from './header.module.scss';
import LogoImg from "../../../public/images/Logo.svg";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <a href='/'>
          <LogoImg className={styles.logoimg} alt="logo" />
        </a>
      </div>
    </header>
  );
}
