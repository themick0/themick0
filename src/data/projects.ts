import type { ImageMetadata } from 'astro';
import forgePlatform from '../../public/projects/forge-desktop.webp';
import forgeCampaign from '../../public/projects/forge-desktop-2.webp';
import forgeTask from '../../public/projects/forge-desktop-3.webp';
import forgeAccount from '../../public/projects/forge-desktop-4.webp';
import forgeSocialAccounts from '../../public/projects/forge-desktop-5.webp';
import neuraWorldMap from '../../public/projects/neuraverse-world-map.webp';
import neuraVillage from '../../public/projects/neuraverse-village.webp';
import neuraRoyalReserve from '../../public/projects/neuraverse-royal-reserve.webp';
import neuraLadyLuck from '../../public/projects/neuraverse-lady-luck.webp';
import neuraBramaDialogue from '../../public/projects/neuraverse-brama-dialogue.webp';
import neuraDefiVillage from '../../public/projects/neuraverse-defi-village.webp';
import neuraOracleDialogue from '../../public/projects/neuraverse-oracle-dialogue.webp';
import neuraBridge from '../../public/projects/neuraverse-bridge.webp';

export interface ProjectScreenshot {
  src: ImageMetadata;
  alt: string;
  caption: string;
}

export interface ProjectVideo {
  src: string;
  poster: ImageMetadata;
  description: string;
}

export interface Project {
  slug: string;
  name: string;
  context: string;
  summary: string;
  outcome?: string;
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
  websiteLabel?: string;
  caseStudy?: ProjectCaseStudy;
}

export interface ProjectCaseStudy {
  description: string;
  lead: string;
  role?: string;
  scope?: string;
  overview?: {
    story?: string;
    images: ProjectScreenshot[];
    video?: ProjectVideo;
    contributions?: { title: string; description: string }[];
  };
  result?: {
    value: string;
    description: string;
    before: string;
    after: string;
    unit: string;
  };
  approachTitle?: string;
  approach?: string[];
}

// Project overviews based on Peter's CV and owner-provided project details.
export const projects: Project[] = [
  {
    slug: 'forge',
    name: 'Ankr Forge',
    context: 'Rewards & Points platform · Ankr Labs',
    summary: 'Built the rewards web app, identity backend and embedded wallet.',
    outcome:
      'Replaced a costly external identity and wallet provider in production.',
    symbol: 'atom',
    website: 'https://www.ankr.com/forge/',
    caseStudy: {
      description:
        'Peter Mikheev built Ankr Forge’s web interface, sign-in system and built-in wallet, fully replacing an external provider in the live rewards platform.',
      lead: 'Ankr Rewards & Points platform: users complete tasks from partner companies, earn points and receive cryptocurrency rewards.',
      overview: {
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
              'Built backend APIs with Node.js and Fastify and designed the PostgreSQL schema. Integrated OAuth login, external wallet connections and account linking, with identity data available to internal services.',
          },
          {
            title: 'Smart wallet',
            description:
              'Built a non-custodial wallet using passkeys and ERC-4337 account abstraction. Users can claim, deposit and withdraw supported tokens without paying network fees.',
          },
          {
            title: 'Frontend app',
            description:
              'Developed the rewards web app with React and TypeScript. Built Core and React SDKs for integrating identity and account functionality into client applications.',
          },
        ],
      },
      approachTitle: 'Implementation and validation',
      approach: [
        'Forge relied on a costly external provider for user sign-in and embedded wallets. I proposed and built Forge’s own identity system and non-custodial passkey wallet, fully replacing the provider in production. I also developed the platform’s web app and integrated it with the backend services.',
        'I delivered features in stages against clear acceptance criteria. Validation combined cross-agent reviews, security-focused reviews and automated tests with end-to-end coverage of critical flows.',
      ],
    },
  },
  {
    slug: 'neuraverse',
    name: 'Neuraverse',
    context: 'Browser web3 game · Ankr Labs',
    summary:
      'Rebuilt the game’s interface with Pixi.js to address performance and stability issues.',
    outcome:
      'Completed the rebuild in two weeks and released it to production.',
    symbol: 'rocket',
    website: 'https://www.neuraprotocol.io/',
    websiteLabel: 'Neura website',
    caseStudy: {
      description:
        'Peter Mikheev rebuilt Neuraverse’s React/CSS game layer with Pixi.js to address performance and stability issues, shipping it to production in two weeks.',
      lead: 'Neuraverse: a browser-based Web3 game at Ankr Labs.',
      overview: {
        story:
          'The existing React/CSS game layer had performance and stability issues. I replaced it with a Pixi.js implementation, completing the rebuild in two weeks and releasing it to production.',
        video: {
          src: 'projects/neuraverse-gameplay.mp4',
          poster: neuraWorldMap,
          description:
            'Silent gameplay recording showing character movement, map zooming and navigation through Neuraverse’s village locations.',
        },
        images: [
          {
            src: neuraWorldMap,
            alt: 'Neuraverse world map showing the village, Validator House, Oracle, Faucet and Bridge.',
            caption: 'World map',
          },
          {
            src: neuraVillage,
            alt: 'A Neuraverse character exploring the village between Validator House, Oracle and Faucet.',
            caption: 'Village exploration',
          },
          {
            src: neuraRoyalReserve,
            alt: 'Neuraverse map showing the Royal Reserve, surrounding paths and a ship beside the river.',
            caption: 'Royal Reserve',
          },
          {
            src: neuraLadyLuck,
            alt: 'A character standing beside The Lady Luck ship with a connected wallet shown in the header.',
            caption: 'The Lady Luck',
          },
          {
            src: neuraBramaDialogue,
            alt: 'Brama character selection with account statistics and a dialogue panel.',
            caption: 'Brama dialogue',
          },
          {
            src: neuraDefiVillage,
            alt: 'DeFi Village showing The Grand Exchange, The Iron Vault and Market of Fate.',
            caption: 'DeFi Village',
          },
          {
            src: neuraOracleDialogue,
            alt: 'Oracle interaction showing the character on the map and a dialogue panel on the right.',
            caption: 'Oracle dialogue',
          },
          {
            src: neuraBridge,
            alt: 'A character near the Bridge with a speech bubble explaining that the path is blocked.',
            caption: 'Bridge interaction',
          },
        ],
      },
    },
  },
  {
    slug: 'davos',
    name: 'Davos Protocol',
    context: 'Stablecoin protocol · Tagus Labs',
    summary:
      'Built the stablecoin web app, including staking flows and dashboards. Optimized data loading with request deduplication and caching of static contract data.',
    outcome:
      'Reduced RPC requests per dashboard load from 300–400 to 50–60 (approximately 85%).',
    symbol: 'petals',
  },
  {
    slug: 'mat-stake',
    name: 'MAT Stake',
    context: 'Staking application · Ankr Labs',
    summary:
      'Built the staking app, wallet integrations and backend APIs. Added IPFS data fetching and caching to speed up the site and dashboards.',
    symbol: 'prism',
    website: 'https://matstake.io/',
  },
  {
    slug: 'swirl',
    name: 'Swirl',
    context: 'Staking application · Ankr Labs',
    summary:
      'Built the staking app and backend APIs, including wallet connections, staking flows and dashboards.',
    symbol: 'spiral',
    website: 'https://swirlstake.com/',
  },
  {
    slug: 'staking-circle',
    name: 'Staking Circle',
    context: 'Staking platform · Tagus Labs',
    summary: 'Designed, built and shipped the staking frontend.',
    symbol: 'rings',
    website: 'https://www.stakingcircle.com/',
  },
  {
    slug: 'inception-lrt',
    name: 'Inception LRT',
    context: 'Staking application · Tagus Labs',
    summary:
      'Built the staking frontend with portfolio and rewards dashboards connected to smart-contract data.',
    symbol: 'portal',
    website: 'https://www.inceptionlrt.com/',
  },
  {
    slug: 'ankr-staking',
    name: 'Ankr Staking',
    context: 'Staking application · Ankr',
    summary:
      'Built and maintained staking interfaces, portfolio dashboards and wallet authentication. Refactored the existing frontend.',
    symbol: 'nodes',
    website: 'https://www.ankr.com/staking/',
  },
  {
    slug: 'ankr-automate',
    name: 'Ankr Automate',
    context: 'Transaction automation · Ankr',
    summary:
      'Built the interface for scheduling recurring smart-contract interactions.',
    symbol: 'cycle',
    website: 'https://www.ankr.com/automate',
  },
];
