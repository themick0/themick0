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
  description: `${name} — ${role}. DeFi Solutions, Full-Stack Engineering and AI Automation. From architecture to production.`,
  expertise: ['DeFi Solutions', 'Full-Stack Engineering', 'AI Automation'],
  socials: [
    { label: 'GitHub', href: github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tenshou' },
    { label: 'Telegram', href: 'https://t.me/peter_mikheev' },
  ],
};
