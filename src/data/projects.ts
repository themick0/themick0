import type { ImageMetadata } from 'astro';
import forgePlatform from '../../public/projects/forge-desktop.webp';
import forgeCampaign from '../../public/projects/forge-desktop-2.png';
import forgeTask from '../../public/projects/forge-desktop-3.png';
import forgeAccount from '../../public/projects/forge-desktop-4.png';
import forgeSocialAccounts from '../../public/projects/forge-desktop-5.png';

export interface ProjectScreenshot {
  src: ImageMetadata;
  alt: string;
  caption: string;
}

export interface Project {
  slug: string;
  name: string;
  context: string;
  summary: string;
  description: string;
  lead: string;
  role?: string;
  scope?: string;
  symbol: 'atom' | 'orbit';
  website?: string;
  overview?: {
    story: string;
    images: ProjectScreenshot[];
    contributions: { title: string; description: string }[];
  };
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
    context: 'Rewards & Points platform · Ankr Labs',
    summary:
      'Built the app with its own identity system and wallet, replacing a paid external service.',
    description:
      'Peter Mikheev built Ankr Forge’s web interface, sign-in system and built-in wallet, fully replacing an external provider in the live rewards platform.',
    lead: 'Ankr Rewards & Points platform: users complete tasks from partner companies, earn points and receive cryptocurrency rewards.',
    symbol: 'atom',
    website: 'https://www.ankr.com/forge/',
    overview: {
      story:
        'I proposed and developed Forge’s own login system and wallet. These services fully replaced a costly external provider in production. I built the platform’s web interface and integrated the new services.',
      images: [
        {
          src: forgePlatform,
          alt: 'Ankr Forge interface showing partner campaigns, sign-in and tasks for earning points.',
          caption: 'Rewards platform',
        },
        {
          src: forgeCampaign,
          alt: 'Ankr partner campaign showing available tasks, points and user progress.',
          caption: 'Partner campaign',
        },
        {
          src: forgeTask,
          alt: 'Task details showing the points reward, completion status and X account connection.',
          caption: 'Task details',
        },
        {
          src: forgeAccount,
          alt: 'Ankr account panel showing the ANKR balance, Google login, wallet management and linked social accounts.',
          caption: 'Ankr account',
        },
        {
          src: forgeSocialAccounts,
          alt: 'Linked social accounts panel with a connected Google account and options to connect Discord and X.',
          caption: 'Linked social accounts',
        },
      ],
      contributions: [
        {
          title: 'Identity service',
          description:
            'Integrated social login via OAuth and external wallet connections. Added account linking and made user data available to internal services.',
        },
        {
          title: 'Smart wallet',
          description:
            'Built a non-custodial wallet using passkeys and ERC-4337 account abstraction. Users can deposit and withdraw supported tokens without paying network fees.',
        },
        {
          title: 'Frontend app',
          description:
            'Developed the rewards platform’s web app and standalone authentication packages for the identity service.',
        },
      ],
    },
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
