export interface Project {
  slug: string;
  name: string;
  context: string;
  summary: string;
  description: string;
  lead: string;
  role: string;
  scope: string;
  symbol: 'atom' | 'orbit';
  website?: string;
  backdrop?: { src: string; width: number; height: number };
  challenge?: string;
  contributions?: { title: string; description: string }[];
  result?: {
    value: string;
    description: string;
    before: string;
    after: string;
    unit: string;
  };
  approach?: string;
}

// Project overviews based on Peter's CV and owner-provided project details.
export const projects: Project[] = [
  {
    slug: 'forge',
    name: 'Ankr Forge',
    context: 'Points & Rewards platform · Ankr Labs',
    summary:
      'Built the app with an identity system and embedded wallet, replacing a paid third-party service.',
    description:
      'Ankr Forge rewards users for completing partner tasks. Peter Mikheev built its sign-in system, embedded wallet, and frontend integrations.',
    lead: 'Ankr Forge is a rewards platform where users earn points by completing partner tasks. Rewards are distributed periodically in Ankr tokens.',
    role: 'Senior Software Engineer · Ankr Labs',
    scope: 'Identity backend, web interface, wallet & SDKs',
    symbol: 'atom',
    website: 'https://www.ankr.com/forge/',
    backdrop: {
      src: 'projects/forge-desktop.webp',
      width: 1600,
      height: 1100,
    },
    challenge:
      'Privy, the third-party sign-in and wallet provider, came with high service costs. I proposed an in-house replacement and took ownership of its implementation with limited backend support and a tight timeline.',
    contributions: [
      {
        title: 'Accounts & sign-in',
        description:
          'Built the identity service for authentication and account linking, including its APIs and database.',
      },
      {
        title: 'Built-in wallet',
        description:
          'Built a non-custodial wallet with passkey signing and account recovery, keeping users in control of their keys.',
      },
      {
        title: 'Web app & SDKs',
        description:
          'Built the React frontend and connected it to the existing points backend and identity service. Created SDKs for reuse across products.',
      },
    ],
    approach:
      'The new system fully replaced Privy in production. Users could sign in with Google and deposit or withdraw supported tokens without paying network fees. The wallet release focused on these flows to meet Forge’s immediate needs.',
  },
  {
    slug: 'davos',
    name: 'Davos Protocol',
    context: 'Staking application · Tagus Labs',
    summary: 'Approximately 85% fewer RPC requests per dashboard load',
    description:
      'Davos Protocol — Peter Mikheev’s frontend work on staking workflows and dashboards, with approximately 85% fewer RPC requests per dashboard load.',
    lead: 'I delivered staking workflows and portfolio and reward dashboards, owning frontend development from technical design to release.',
    role: 'Senior Software Engineer · Tagus Labs',
    scope: 'Frontend development, from technical design to release',
    symbol: 'orbit',
    result: {
      value: 'Approximately 85%',
      description: 'fewer RPC requests per dashboard load.',
      before: '300–400',
      after: '50–60',
      unit: 'RPC requests per dashboard load',
    },
    approach:
      'I reduced RPC requests through request deduplication and caching of static contract data.',
  },
];
