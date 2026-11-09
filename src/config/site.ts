export const site = {
  name: 'Plurality',
  legalName: 'Plurality LLC',
  url: 'https://plurality.run',
  title: 'Plurality | Connect your agents. Keep the history.',
  description:
    'Open infrastructure and practical services for a web of people, agents, and applications. Plurality is in early development, starting with the Synchronic Web.',
  links: {
    github: 'https://github.com/plurality-run',
    syncWeb: 'https://github.com/plurality-run/sync-web',
    x: 'https://x.com/plurality_run',
  },
  social: { xHandle: '@plurality_run', image: '/brand/social-card.png' },
  navigation: [
    { label: 'The direction', href: '/#direction' },
    { label: 'Open foundations', href: '/#foundations' },
  ],
} as const;

// The main branch is production. Preview builds must not advertise themselves to search engines.
export const isPreview = Boolean(
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main',
);
