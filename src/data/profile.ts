const name = 'Peter Mikheev';
const roleLines = ['Senior Software', 'Engineer'] as const;
const role = roleLines.join(' ');

export const profile = {
  name,
  handle: 'themick0',
  role,
  roleLines,
  email: 'pamiheevcorp@gmail.com',
  description: `${name} — ${role}. Full-Stack Engineering, DeFi Solutions and AI Automation. From architecture to production.`,
  expertise: ['Full-Stack Engineering', 'DeFi Solutions', 'AI Automation'],
  socials: [
    { label: 'GitHub', href: 'https://github.com/themick0' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tenshou' },
    { label: 'Telegram', href: 'https://t.me/peter_mikheev' },
  ],
};
