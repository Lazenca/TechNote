// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Lazenca.net',
  tagline: 'Exploit & Reverse Engineering Tech Note',
  favicon: 'img/favicon.ico',

  url: 'https://www.lazenca.net',
  baseUrl: '/',

  organizationName: 'Lazenca',
  projectName: 'lazenca.github.io',

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'noai, noimageai',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'tdm-reservation',
        content: '1',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'naver-site-verification',
        content: '406a539707ccca1f0a2743d07c1afa0baee2c931',
      },
    },
  ],

  onBrokenLinks: 'warn',
  markdown: {
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'ignore',
      onBrokenMarkdownImages: 'ignore',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      ko: {
        label: '한국어',
        direction: 'ltr',
        htmlLang: 'ko-KR',
      },
    },
  },

  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en", "ko"],
        docsRouteBasePath: "/",
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-2RSVE4E1RH',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: 'robots', content: 'noai, noimageai' },
        { name: 'tdm-reservation', content: '1' },
      ],
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Lazenca.net',
        logo: {
          alt: 'Lazenca Logo',
          src: 'img/logo-light.png',
          srcDark: 'img/logo-dark.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'TechNote',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/Lazenca',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'TechNote',
                to: '/category/02technote',
              },
            ],
          },
          {
            title: 'Social & Profile',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Lazenca',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/0x0Lazenca',
              },
              {
                label: 'Facebook',
                href: 'https://www.facebook.com/Lazenca.0x0',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Lazenca. All rights reserved. Strictly Non-Commercial & No AI Training. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['cpp', 'c', 'python', 'bash', 'java', 'nasm'],
      },
    }),
};

export default config;
