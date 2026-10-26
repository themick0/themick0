const name = 'Peter Mikheev';
const github = 'https://github.com/themick0';
const roleLines = ['Senior Software', 'Engineer'] as const;
const role = roleLines.join(' ');

export const profile = {
  name,
  handle: 'themick0',
  github,
  role,
  roleLines,
  email: 'pamiheevcorp@gmail.com',
  cv: 'cv/',
  description:
    'Full-stack engineering, Web3 solutions and AI integrations. From architecture to production.',
  expertise: ['Full-Stack Engineering', 'Web3 Solutions', 'AI Automation'],
  socials: [
    { label: 'GitHub', href: github },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/peter-mikheev-themick0/',
    },
    { label: 'Telegram', href: 'https://t.me/peter_mikheev' },
  ],
};
