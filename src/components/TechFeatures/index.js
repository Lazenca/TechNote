import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const getCategoryList = (isEn) => [
  {
    title: 'Exploit & Heap Analysis',
    icon: (
      <svg className={styles.categoryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    description: isEn
      ? 'Basic & Advanced Exploit techniques, Heap Exploitation, memory structures, and mechanism analysis notes'
      : 'Basic & Advanced Exploit 기술, Heap Exploitation, 메모리 구조 및 메커니즘 분석 테크 노트',
    tags: ['Heap Exploitation', 'Buffer Overflow', 'Memory Structure', 'Shellcode'],
    link: '/category/05basic-exploitation-techniques',
    color: '#e74c3c',
  },
  {
    title: 'Reverse Engineering & Fuzzing',
    icon: (
      <svg className={styles.categoryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
    description: isEn
      ? 'Binary reverse engineering, fuzzing-based vulnerability discovery, analysis tools, and guides'
      : '바이너리 리버스 엔지니어링, Fuzzing 기반 취약점 탐지, 분석 도구 활용 및 가이드',
    tags: ['Reversing', 'Fuzzing', 'Analysis Tools', 'GDB / IDA'],
    link: '/category/03analysis',
    color: '#3498db',
  },
  {
    title: 'OS Security & Protection Tech',
    icon: (
      <svg className={styles.categoryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    ),
    description: isEn
      ? 'Linux Kernel analysis, OS security mitigations, and vulnerability defense mechanism research'
      : 'Linux Kernel 분석, OS 보안 완화 기법(Mitigations) 및 취약점 방어 메커니즘 연구',
    tags: ['Linux Kernel', 'ASLR / DEP', 'Canary', 'Mitigation'],
    link: '/category/02protection-tech',
    color: '#2ecc71',
  },
  {
    title: 'Vulnerability Research & CTF',
    icon: (
      <svg className={styles.categoryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    description: isEn
      ? 'Real-world vulnerability analysis, system pwnable challenges, and CTF writeup archives'
      : '실전 취약점 분석 사례, 시스템 포너블(Pwnable) 및 CTF 문제 풀이 문서 모음',
    tags: ['Pwnable', 'CTF Writeups', 'Vulnerability', 'POC'],
    link: '/category/01ctf',
    color: '#9b59b6',
  },
];

const SocialLinks = [
  {
    name: 'GitHub Profile',
    handle: '@Lazenca',
    url: 'https://github.com/Lazenca',
    badge: 'Code & Repositories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    handle: '@0x0Lazenca',
    url: 'https://twitter.com/0x0Lazenca',
    badge: 'Updates & News',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'Lazenca.0x0',
    url: 'https://www.facebook.com/Lazenca.0x0',
    badge: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export default function TechFeatures() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';
  const categoryList = getCategoryList(isEn);

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        {/* Research Topics Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>EXPLORE TECH NOTE</div>
          <Heading as="h2" className={styles.sectionTitle}>
            {isEn ? 'Core Security & Technical Analysis Categories' : '주요 보안 및 기술 분석 카테고리'}
          </Heading>
          <p className={styles.sectionSubtitle}>
            {isEn
              ? 'Key topics covered on Lazenca.net including binary exploitation, kernel analysis, and reverse engineering.'
              : 'Lazenca.net에서 다루는 바이너리 익스플로잇, 커널 분석, 리버스 엔지니어링의 핵심 주제들입니다.'}
          </p>
        </div>

        <div className="row">
          {categoryList.map((cat, idx) => (
            <div key={idx} className="col col--6 margin-bottom--lg">
              <Link to={cat.link} className={styles.categoryCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper} style={{ color: cat.color, borderColor: `${cat.color}44` }}>
                    {cat.icon}
                  </div>
                  <Heading as="h3" className={styles.cardTitle}>
                    {cat.title}
                  </Heading>
                </div>
                <p className={styles.cardDescription}>{cat.description}</p>
                <div className={styles.tagList}>
                  {cat.tags.map((tag, tIdx) => (
                    <span key={tIdx} className={styles.tagChip}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Profile & Social Section */}
        <div className={clsx(styles.sectionHeader, 'margin-top--xl')}>
          <div className={styles.sectionBadge}>CONNECT & FOLLOW</div>
          <Heading as="h2" className={styles.sectionTitle}>
            {isEn ? 'Lazenca.0x0 Profile & Community' : 'Lazenca.0x0 프로필 & 커뮤니티'}
          </Heading>
          <p className={styles.sectionSubtitle}>
            {isEn
              ? 'Check out the latest research updates and open-source materials on official social channels.'
              : '최신 연구 업데이트와 오픈소스 자료를 공식 소셜 채널에서 확인하세요.'}
          </p>
        </div>

        <div className="row">
          {SocialLinks.map((item, idx) => (
            <div key={idx} className="col col--4 margin-bottom--md">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                <div className={styles.socialHeader}>
                  <span className={styles.socialIcon}>{item.icon}</span>
                  <span className={styles.socialBadge}>{item.badge}</span>
                </div>
                <div className={styles.socialName}>{item.name}</div>
                <div className={styles.socialHandle}>{item.handle}</div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
