import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import TechFeatures from '@site/src/components/TechFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig, i18n} = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroOverlay} />
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroBadge}>
          <span className={styles.badgePulse} />
          SYSTEM SECURITY & REVERSING RESEARCH
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          {isEn
            ? 'A technical document archive covering Binary Exploitation, Heap Analysis, Reverse Engineering, and Kernel Security techniques.'
            : '바이너리 익스플로잇(Binary Exploitation), 힙 분석(Heap), 리버스 엔지니어링 및 커널 보안 기법을 다루는 기술 문서 보관소입니다.'}
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary button--lg', styles.mainBtn)}
            to="/category/02technote">
            {isEn ? '🚀 Explore TechNotes' : '🚀 TechNote 문서 둘러보기'}
          </Link>
          <a
            className={clsx('button button--outline button--secondary button--lg', styles.subBtn)}
            href="https://github.com/Lazenca"
            target="_blank"
            rel="noopener noreferrer">
            🐙 GitHub Profile
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig, i18n} = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <Layout
      title={isEn ? `Welcome to ${siteConfig.title}` : `Welcome to ${siteConfig.title}`}
      description={
        isEn
          ? 'Exploit & Reverse Engineering Tech Note by Lazenca.0x0'
          : 'Exploit & Reverse Engineering Tech Note by Lazenca.0x0'
      }>
      <HomepageHeader />
      <main>
        <TechFeatures />
      </main>
    </Layout>
  );
}
