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
  cv: 'https://docs.google.com/document/d/1IYf3gFEx1d9iv_SeCIcJF_PlgPekLYwY/edit',
  description: `${name} — ${role}. DeFi Solutions, Full-Stack Engineering and AI Automation. From architecture to production.`,
  expertise: ['Full-Stack Engineering', 'DeFi Solutions', 'AI Automation'],
  socials: [
    { label: 'GitHub', href: github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tenshou' },
    { label: 'Telegram', href: 'https://t.me/peter_mikheev' },
  ],
};
