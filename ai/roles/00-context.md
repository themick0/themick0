# Shared context for all roles

Updated: October 17, 2026. This file reflects decisions made in the conversation up to this date; Peter's newer instructions take precedence.

## Person and purpose

- Name: **Peter Mikheev**.
- Technical identity: **themick0**.
- GitHub: https://github.com/themick0.
- The personal website supports both employment opportunities and project collaboration.
- Audience: founders, CTOs, engineering leaders, recruiters, prospective clients, and partners working in SaaS, B2B, Web3/DeFi, and AI products.
- All repository content is in English, including documentation, role instructions, rules, and comments. Conversation follows the user's language. See the [language rule](../rules/repository-language.md).

## Current positioning

The [Cosmos reference](../../concepts/cosmos/index.html) and the application use **Senior Software Engineer**, with every word set in large type. Peter's latest explicit specialization line is **Full-Stack Engineering · DeFi Solutions · AI Automation**. These phrases take precedence over earlier recommendations.

The earlier `Senior Product Engineer` positioning captures product thinking, end-to-end ownership, and engineering depth. Preserve these qualities in the meaning and examples; they do not need to appear in the job title.

Full-stack is the broad primary profile. DeFi and Web3 are areas of established production experience. AI Automation is a developing direction that Peter explicitly asked to include in the hero. Do not remove it based on earlier recommendations or attribute unsupported projects or metrics to it.

## Verified facts

Source: [Peter's CV](https://docs.google.com/document/d/1IYf3gFEx1d9iv_SeCIcJF_PlgPekLYwY/edit), read through Google Drive on October 14, 2026 (modified October 13, 2026).

- More than 8 years in software engineering.
- React, TypeScript, JavaScript, and Node.js.
- Full-stack applications, architecture, backend services, APIs, SDKs, and complex integrations.
- Production experience in DeFi, staking, wallet infrastructure, account abstraction, identity, authentication, and Web3 infrastructure.
- Smart accounts, passkeys, ERC-4337, and on-chain / off-chain integrations are part of the supplied professional context.
- The supplied CV confirms work on project-specific AI agent harnesses at Ankr Labs: repository instructions, structured context, and automated validation for implementation and code review. AI-assisted engineering supports planning, implementation, analysis, and verification. Architectural decisions, quality, and validation remain the developer's responsibility.

Do not turn 8+ years of overall experience into a claim of eight years with every individual technology.

## Claims not to invent

Do not invent companies, projects, testimonials, revenue, metrics, system scale, user counts, or results. DeFi integration experience alone does not establish smart contract development experience.

The CV confirms internal AI engineering workflows at Ankr Labs. It does not establish a separate commercial AI product, client AI case study, or measured outcome. Do not add unsupported metrics.

Do not claim team management experience, current hiring availability, location, working time zone, pricing, or employment preferences without evidence. Ambitions in product discovery and leadership do not establish past achievements.

## Current stage and approved decisions

A static Astro + TypeScript application has been implemented from [Cosmos](../../concepts/cosmos/index.html). The application lives in `src/`; workflow and commands are in the [README](../../README.md). The package manager is pnpm.

Peter requested keeping the application, README, role instructions, and Cosmos source. Other concepts, early prototypes, plans, archives, and reports have been removed. AI instructions now live in `ai/roles/`, with repository rules in `ai/rules/`. The retained Cosmos prototype is the application's visual reference; its [description](../../concepts/cosmos/README.md) documents the design and motion.

Home page order: large Senior Software Engineer heading → My work → About → Let’s talk. The project section and its main navigation link are labeled “My work”. Full-Stack Engineering comes first in the specialization line. About covers full-stack applications, new and existing products, responsibility for backend and UI, and recent identity/DeFi work. Do not reintroduce repeated experience duration in About, vague system integrations, or the rejected copy about transitioning from frontend.

The design uses a dark background, cool blue and lavender highlights, a planet, stars, and comets. The pointer gently changes the camera direction; there are no particles attached to the cursor. Motion continues without mouse input, while reduced motion provides a static scene. Opening comet tails follow their screen-space flight direction at every aspect ratio. Section links use native smooth scrolling unless reduced motion is requested. On touch devices, the opening's minimum height stays stable during browser toolbar changes and adapts when the viewport width changes. There is no pause/play button, at Peter's explicit request.

Projects open on separate pages. Contacts use ordinary links. The production domain is `https://themick0.com/`; indexing is configured through `SITE_URL` and `SITE_INDEXABLE`. The site is deployed through GitHub Actions and served by Nginx.

In the header and footer, Peter Mikheev links to the top of the home page, while themick0 links to the GitHub profile with hover and keyboard focus states. Links must not have text underlines on hover anywhere on the site. The header star is an inline SVG so it renders consistently on mobile and desktop.

## Verified projects

- **Ankr Forge, Ankr Labs:** identity platform; backend architecture, APIs, database, React application, core SDK, and React SDK. [Reference overview](../../concepts/cosmos/projects/forge.html).
- **Davos Protocol, Tagus Labs:** frontend staking workflows and dashboards, from technical design to release. Approximately 85% fewer RPC requests per dashboard load, from 300–400 to 50–60, through request deduplication and caching static contract data. This does not imply the same improvement in UI speed or costs. [Reference overview](../../concepts/cosmos/projects/davos.html).

The source is the supplied CV linked above; the copy was approved during design work. Detailed measurement conditions for the RPC metric and materials for full case studies have not been provided. Do not extend the overviews with invented decisions, metrics, or images. Current project copy lives in the [typed data](../../src/data/projects.ts).

## Primary and supporting information

The home page should quickly explain who Peter is, what problems he solves, what supports those claims, and how to view his work and contact him.

Detailed technologies, constraints, decisions, results, and professional context can be available on demand. Do not hide the main role, value, brief evidence of experience, or contacts behind interactions.

A separate page with its own URL is the recommended format for a full case study. Native disclosure or a modal can work for short supporting information. Choose based on content rather than the desire to add an effect.

## First-version materials and constraints

- Ankr Forge and Davos Protocol are the selected real projects. Their short pages use the verified information above.
- Contacts from the [README](../../README.md): `pamiheevcorp@gmail.com`, https://www.linkedin.com/in/tenshou, https://t.me/peter_mikheev. Confirm they are current before public launch.
- The production domain is `https://themick0.com/`. Do not invent owner details.
- Application stack: Astro SSG, TypeScript, and scoped CSS; add components and dependencies as needed.
- No backend, CMS, database, blog, additional languages, or complex contact form in the first version.
- The home page and two short project overviews are implemented; detailed case studies require additional real materials.
- Content and contact actions work without JS. Responsive layout, keyboard access, focus, contrast, and reduced motion are required.
- The prototype is not published publicly. If remote review is needed, `noindex` does not replace restricted access.

## Source priority

1. Peter's latest explicit instructions.
2. Facts he supplied and explicitly approved decisions.
3. This shared context and current-stage outputs with their stated status.
4. The [Cosmos reference](../../concepts/cosmos/index.html), its description, and the [README](../../README.md).

Reviewing an earlier plan does not approve a new design or new copy. Identify conflicting facts; do not choose the stronger marketing claim without evidence.
