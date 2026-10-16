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

// Approved project overviews from concepts/cosmos/projects/.
export const projects: Project[] = [
  {
    slug: 'forge',
    name: 'Ankr Forge',
    context: 'Identity platform · Ankr Labs',
    summary:
      'Designed and shipped the backend, React application, and developer SDKs.',
    description:
      'Ankr Forge — Peter Mikheev’s work on an identity platform, including backend architecture, APIs, a React application, and developer SDKs.',
    lead: 'I designed and shipped a platform for user authentication, account linking, and transaction workflows, covering both the backend and the React application.',
    role: 'Senior Software Engineer · Ankr Labs',
    scope: 'Backend, React application & SDKs',
    symbol: 'atom',
    contributions: [
      {
        title: 'Backend',
        description: 'Backend architecture, APIs, and database design.',
      },
      {
        title: 'Application',
        description: 'Frontend development of the React application.',
      },
      {
        title: 'Developer SDKs',
        description: 'Core and React SDKs for client integrations.',
      },
    ],
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
