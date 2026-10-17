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
  symbol:
    | 'atom'
    | 'rocket'
    | 'prism'
    | 'spiral'
    | 'petals'
    | 'rings'
    | 'portal'
    | 'nodes'
    | 'cycle';
  website?: string;
  caseStudy?: ProjectCaseStudy;
}

export interface ProjectCaseStudy {
  description: string;
  lead: string;
  role?: string;
  scope?: string;
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
    symbol: 'atom',
    website: 'https://www.ankr.com/forge/',
    caseStudy: {
      description:
        'Peter Mikheev built Ankr Forge’s web interface, sign-in system and built-in wallet, fully replacing an external provider in the live rewards platform.',
      lead: 'Ankr Rewards & Points platform: users complete tasks from partner companies, earn points and receive cryptocurrency rewards.',
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
  },
  {
    slug: 'neuraverse',
    name: 'Neuraverse',
    context: 'Browser web3 game · Ankr Labs',
    summary:
      'Replaced the React game layer with Pixi.js to improve performance and stability. Delivered the implementation in two weeks.',
    symbol: 'rocket',
    website: 'https://neuraverse.neuraprotocol.io/',
  },
  {
    slug: 'mat-stake',
    name: 'MAT Stake',
    context: 'Staking application · Ankr Labs',
    summary:
      'Built the staking app with wallet integrations, backend APIs and performance dashboards. Integrated IPFS storage with advanced caching.',
    symbol: 'prism',
    website: 'https://matstake.io/',
  },
  {
    slug: 'swirl',
    name: 'Swirl',
    context: 'Staking application · Ankr Labs',
    summary:
      'Delivered staking workflows and dashboards with wallet connectivity and backend APIs.',
    symbol: 'spiral',
    website: 'https://swirlstake.com/',
  },
  {
    slug: 'davos',
    name: 'Davos Protocol',
    context: 'Staking application · Tagus Labs',
    summary:
      'Built staking workflows and dashboards. Reduced RPC requests per dashboard load by approximately 85%.',
    symbol: 'petals',
  },
  {
    slug: 'staking-circle',
    name: 'Staking Circle',
    context: 'Web3 platform · Tagus Labs',
    summary:
      'Owned frontend delivery from technical design through production release using React and TypeScript.',
    symbol: 'rings',
    website: 'https://www.stakingcircle.com/',
  },
  {
    slug: 'inception-lrt',
    name: 'Inception LRT',
    context: 'Staking application · Tagus Labs',
    summary:
      'Built staking workflows and portfolio and reward dashboards with smart-contract data.',
    symbol: 'portal',
    website: 'https://www.inceptionlrt.com/',
  },
  {
    slug: 'ankr-staking',
    name: 'Ankr Staking',
    context: 'Staking application · Ankr',
    summary:
      'Developed staking interfaces, portfolio dashboards and wallet authentication while modernizing the existing frontend.',
    symbol: 'nodes',
    website: 'https://www.ankr.com/staking/',
  },
  {
    slug: 'ankr-automate',
    name: 'Ankr Automate',
    context: 'Transaction automation · Ankr',
    summary:
      'Built an interface for scheduling and automating recurring smart-contract interactions.',
    symbol: 'cycle',
    website: 'https://www.ankr.com/automate',
  },
];
