import styles from './pengawas.module.css';

export default function Skeleton() {
  return (
    <div role="status" aria-label="Memuat data">
      <div className={`${styles.skel} ${styles.skelHero}`} />
      <div className={`${styles.skel} ${styles.skelRow}`} />
      <div className={`${styles.skel} ${styles.skelRow}`} />
    </div>
  );
}
