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
    'Full-stack engineering, DeFi solutions and AI integrations. From architecture to production.',
  expertise: ['Full-Stack Engineering', 'DeFi Solutions', 'AI Automation'],
  socials: [
    { label: 'GitHub', href: github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tenshou' },
    { label: 'Telegram', href: 'https://t.me/peter_mikheev' },
  ],
};
