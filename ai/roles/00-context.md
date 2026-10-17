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

The [Cosmos reference](../../concepts/cosmos/index.html) and the application use **Senior Software Engineer**, with every word set in large type. Peter's latest explicit specialization line is **DeFi Solutions · Full-Stack Engineering · AI Automation**. These phrases take precedence over earlier recommendations.

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

Home page order: large Senior Software Engineer heading → My work → About → Let’s talk. The project section and its main navigation link are labeled “My work”. DeFi Solutions comes first in the specialization line. About covers full-stack applications, new and existing products, responsibility for backend and UI, and recent identity/DeFi work. Do not reintroduce repeated experience duration in About, vague system integrations, or the rejected copy about transitioning from frontend.

The design uses a dark background, cool blue and lavender highlights, a planet, stars, and comets. The pointer gently changes the camera direction; there are no particles attached to the cursor. Motion continues without mouse input, while reduced motion provides a static scene. Opening comet tails follow their screen-space flight direction at every aspect ratio. Section links use native smooth scrolling unless reduced motion is requested. On touch devices, the opening's minimum height stays stable during browser toolbar changes and adapts when the viewport width changes. There is no pause/play button, at Peter's explicit request.

Small star clusters extend the Cosmos background down the home page: one on the left beside the expanded project list and one on the right at the start of About. They follow the content when More reveals the remaining projects. `StarCluster.astro` uses distinct, deterministic SVG fields with subtle blue/lavender light and reduced intensity on phones. Selected stars gently twinkle at different intervals while two layers drift slowly in opposite phases. Scroll adds gently eased parallax at different depths, capped at 24 px on desktop and 14 px on phones. Only visible fields are measured, with passive scroll events coalesced into a single requested frame and no continuous JavaScript animation loop. CSS handles the ambient motion; an IntersectionObserver pauses it offscreen, and tab visibility pauses it in the background. Reduced motion and disabled JavaScript keep the fields static. The decorative layer stays behind the content, ignores pointer input, is hidden from assistive technology, and is omitted in print and forced-color modes.

About includes a formation of three Imperial Star Destroyers at Peter's request, rendered as an abstract geometric silhouette with broad dark navy planes and restrained blue/lavender edge highlights to match Cosmos. At Peter’s request, the image retains the recognizable wedge hull, bridge and sensor domes while removing tiny panels, machinery, windows and surface texture. `DestroyerArrival.astro` waits 650 ms after the lazy-loaded image has decoded and at least 35% of the scene is visible, then starts the formation’s arrival once. The main ship starts first, followed almost immediately by an upper-right escort and then a lower-right escort. The upper escort uses 42% of the main ship’s width and sits above it with an 8% right inset and a -32% top offset, bringing it inward and closer to the main ship vertically. The lower escort is larger at 52%, positioned near the page’s right edge beyond the main ship’s right side, slightly lower in its overall composition and with more visible lighting. Both remain smaller and dimmer than the main ship to convey distance. The complete formation is shifted left by a shared 32 px offset on desktop and 12 px below 1024 px, preserving the spacing and sizes of all three ships. The flight clip includes this offset, and each entry distance is measured from the shifted resting position. Each has its own arrival and drift state; the start delays are 650 ms, 850 ms and 1050 ms. At Peter’s request the flights overlap, starting 200 ms apart rather than waiting for the previous arrival to finish. The approved abstract asset is rotated 8 degrees clockwise in CSS to raise its bow and make the ship more horizontal. The flight slope is derived from this same rotation, keeping the trajectory aligned with the hull. The ship enters from beyond the right page edge along this shallower diagonal, moving quickly before smoothly braking into position over 1.8 seconds for each ship. Each ship’s entry distance is measured from its own resting position. A dedicated clip extends to the page edge and accommodates the vertical flight path without horizontal overflow. The ship uses one continuous transform rather than stepped scaling or animated blur. The arrival has no comet-like trails behind the ship, at Peter’s request. After arrival, the main ship has a subtle 10 px drift and slight rotation with an eight-second half-cycle; the distant escorts drift less and more slowly. The resting position is raised 88 px on desktop/tablet and 24 px on phones from the first version. Motion pauses offscreen or in a background tab; reduced motion and no JavaScript show the complete static formation. The formation sits to the right of the description on desktop and below it on phones, with additional vertical space to keep the upper escort clear of the text, without changing the approved copy. It is decorative, ignores pointer input, and is omitted in forced-color and print modes. The transparent source is `src/assets/imperial-destroyer-abstract.png`, generated with the built-in image_gen tool; the exact prompt is saved alongside it in `imperial-destroyer-abstract.prompt.txt`. Astro serves an optimized WebP derived from the transparent source.

Ankr Forge opens its local case page. Other projects link directly to the website supplied in the CV in a new tab. Projects without a website are non-interactive rows with no arrow or link styling. Contacts use ordinary links. The production domain is `https://themick0.com/`; indexing is configured through `SITE_URL` and `SITE_INDEXABLE`. The site is deployed through GitHub Actions and served by Nginx.

In the header and footer, Peter Mikheev links to the top of the home page, while themick0 links to the GitHub profile with hover and keyboard focus states. Links must not have text underlines on hover anywhere on the site. The header star is an inline SVG so it renders consistently on mobile and desktop.

## Verified projects

- **Ankr Forge, Ankr Labs:** Rewards & Points platform. Users earned points by completing tasks supplied by partners and periodically received rewards in the company's tokens. The business intent was to increase token circulation and liquidity; no measured outcome has been supplied for either. A separate points backend was owned by other engineers. Peter built its integration with the frontend and identity service, not the points backend itself. He proposed and built an in-house identity service and non-custodial embedded smart wallet to address high Privy costs. With limited backend capacity and time, he implemented the identity backend, frontend, wallet, and Core and React SDKs. The solution fully replaced Privy within Forge. Passkey-based signing, account recovery, and deposits and withdrawals for supported tokens with paymaster-sponsored gas reached production. The wallet release deliberately focused on the flows needed by the platform. Reuse in other products, external identity/wallet integrations, and paid partner support were planned but had not shipped when Peter's work ended. Partners participated in the points program; this does not establish partner adoption of the identity service or wallet. No measured cost savings have been supplied. These details were confirmed directly by Peter in the October 17 conversation and supersede the earlier identity-only framing.
- **Davos Protocol, Tagus Labs:** frontend staking workflows and dashboards, from technical design to release. Approximately 85% fewer RPC requests per dashboard load, from 300–400 to 50–60, through request deduplication and caching static contract data. This does not imply the same improvement in UI speed or costs. [Reference overview](../../concepts/cosmos/projects/davos.html).

Sources are the supplied CV linked above and Peter's subsequent project clarifications. Detailed measurement conditions for the RPC metric have not been provided. Do not extend the overviews with invented decisions, metrics, or images. Current project copy lives in the [typed data](../../src/data/projects.ts).

## Project list and navigation

Peter requested expanding the home-page list from the named products in his CV on October 17. The CV was fetched again through Google Drive, and the hyperlinks were extracted from its original Word document. The list contains nine projects: Ankr Forge, Neuraverse, MAT Stake, Swirl, Davos Protocol, Staking Circle, Inception LRT, Ankr Staking, and Ankr Automate. Earlier employers without separately named products are not presented as invented project names.

- The list initially shows three projects. A single `More` button reveals all remaining entries in place and then disappears; focus moves to the first revealed project without scrolling. Hash links reveal their target automatically. Without JavaScript or when printing, all projects remain available.
- Rows are more compact: a 148 px minimum height with 22 px vertical padding on desktop, and 20 px vertical padding with 12 px gaps on phones. Text remains unchanged.
- Description line length is slightly wider at 36ch. The My work section has 50 px top padding on desktop and 16 px on phones. Its label and the About label use 16 px desktop / 13 px mobile type. The opening leaves 112 px on desktop or 96 px on phones for the start of the project section, subject to the content's minimum height; touch viewport stabilization remains in place.
- Each project has a distinct inline SVG in the existing thin line style: atom for Forge, rocket for Neuraverse (Peter’s explicit request), prism for MAT Stake, spiral for Swirl, seven geometric petals radiating from the center for Davos (Peter’s explicit request), interlocking rings for Staking Circle, nested diamonds for Inception LRT, validator nodes for Ankr Staking, and a clock with circular arrows for Ankr Automate.
- Ankr Forge retains its case page and approved summary. This is the only generated project page for now.
- Other projects with CV hyperlinks open those URLs directly in a new tab using ordinary anchors and `noopener noreferrer`. Their summaries describe Peter's contribution rather than general product marketing.
- Davos has no website link in the supplied CV. Its summary includes frontend delivery and approximately 85% fewer RPC requests per dashboard load; it has no arrow, click action, keyboard stop, or interactive hover treatment. Its former detail route is no longer generated. The verified measurement details remain above.
- Neuraverse: labeled “Browser web3 game” at Peter's request. Replaced the React/CSS game layer with Pixi.js to address performance and stability, delivered an implementation in two weeks, and took it to production. CV URL: https://neuraverse.neuraprotocol.io/. This currently redirects to Neura's main site; the original CV URL is retained.
- MAT Stake and Swirl: shipped staking applications with wallet integrations, BFF APIs, staking workflows, and performance dashboards. CV URLs: https://matstake.io/ and https://swirlstake.com/. Peter additionally confirmed IPFS storage and caching for MAT Stake in this conversation. His approved summary sentence is: “Integrated IPFS storage with advanced caching.” Do not invent cache layers or performance metrics.
- Staking Circle and Inception LRT: owned frontend delivery from technical design to release, with staking workflows and portfolio/reward dashboards described in the Tagus Labs role. CV URLs: https://www.stakingcircle.com/ and https://www.inceptionlrt.com/.
- Ankr Staking: built and maintained staking interfaces, portfolio dashboards, and wallet authentication while refactoring the legacy frontend. CV URL: https://www.ankr.com/staking/.
- Ankr Automate: built the interface for scheduling recurring smart-contract interactions. CV URL: https://www.ankr.com/automate.

Project data is in `src/data/projects.ts`. Optional `caseStudy` data controls internal page generation and takes priority over a website link in the list. Without either destination, `src/components/Projects.astro` renders a plain text row. The Forge page's next-project link follows the same internal/external distinction and skips entries without destinations.

## Ankr Forge page revision

Status: Implemented locally at Peter's request. The compact copy and layout follow the agreed plan and have passed build, browser, navigation, and automated accessibility checks.

Keep the separate Forge page as a concise case explaining the product, Peter's ownership, the reason for the work, and the shipped result. It should add decisions and context to the home-page summary without requiring visitors to read every paragraph to understand the contribution.

Current structure and requirements:

1. Keep the project name on the left and `Visit website` aligned to the right edge of the heading row, following Peter’s latest placement request. The top return link is a quiet text link rather than another outlined button.
2. Introduce the product as `Ankr Rewards & Points platform` in one sentence below the title: users complete tasks from partner companies, earn points, and receive cryptocurrency rewards. The separate category/company eyebrow has been removed from the Forge detail page at Peter's request to reduce the stacked text; `Rewards & Points platform` remains on the home-page project card.
3. Combine the problem, Peter's initiative, ownership, and shipped result in one short paragraph. Directly name Forge's own login system and wallet, which Peter proposed and developed to fully replace a costly external provider in production. Give his ownership of the platform's web interface and service integration its own sentence. Peter prefers direct, professional sentences over long clauses joined by commas; shortening is optional, and preserving the substance takes priority. Avoid abstract references such as “its replacement” and “the new system” when they obscure what he built. There is no separate “My work” label or component list. Keep identity, SDK, and provider names out of the introduction when plain descriptions explain the responsibility. Any description of points functionality must distinguish integration with the existing points backend from authorship of that backend.
4. Show the readable inline gallery directly after this introduction. The image illustrates the application; it does not establish ownership or architecture quality.
5. Show three concise contribution blocks beside the gallery: `Identity service`, `Smart wallet`, and `Frontend app`. These replace the earlier wallet-fee and release-scope notes at Peter’s request. Identity covers OAuth social login, external wallet connections, account linking, and user data access for internal services. The smart wallet uses passkeys and ERC-4337 account abstraction with non-custodial ownership; network-fee sponsorship is limited to deposits and withdrawals of supported tokens. Frontend covers the rewards web app and standalone authentication packages for the identity service. These implementation details belong in the supporting blocks rather than the introductory paragraph. Do not imply cross-product adoption, ownership of the separate points backend, or fee sponsorship for every possible wallet operation.

The separate Role/Scope block, earlier contribution cards, and generic challenge/result sections have been removed from Forge. The current contribution blocks use short headings and paragraphs rather than cards. Return navigation, contact access, the external website link, and the Cosmos visual style are preserved. Davos, the home page, and About were not redesigned as part of this revision.

Use concise English and avoid repeating the same outcome across sections. Describe high provider costs as the motivation and the production replacement as the verified result. Do not imply measured savings, zero security risk, a fully featured wallet, or adoption of the SDKs in other products. Describe gas sponsorship without asserting who funded it.

Implementation lives in `src/data/projects.ts` and `src/pages/projects/[slug].astro`. The Forge content area has a 1200 px maximum width. On wide screens the gallery and contribution column use a 1.75:1 ratio with a 40 px gap, balancing their heights while preserving the screenshot’s 16:9 proportions. The gallery fills its column without the earlier 600 px cap. Below 1200 px the three contribution blocks form columns beneath the gallery; below 768 px they stack in reading order. The introductory story retains its readable line-length limit. Checks covered responsive widths from 320 to 1920 px, doubled text size, navigation without JavaScript, desktop keyboard navigation, and automated accessibility in Chromium, Firefox, WebKit, and emulated mobile Chromium/WebKit. Visual comparison during the page revision confirmed that Davos remained pixel-identical at 390 and 1440 px. The build and static HTML, link, metadata, and asset validation passed. These are local checks, not real-device testing or publication.

Peter subsequently requested a simple gallery using all five supplied screenshots: the platform overview, partner campaign, task details, Ankr account panel, and linked social accounts. The account screens illustrate the identity features alongside the rewards experience. The current implementation is in `src/components/ProjectGallery.astro` and `src/scripts/project-gallery.ts`:

- Astro generates matching 1600 × 900 WebP images at build time, using a top-aligned crop without stretching the interface. The first screenshot is cropped at the bottom. The same normalized images appear inline and enlarged; the supplied originals remain intact.
- Native horizontal scrolling supports swipes. Only previous/next arrows remain below the image, aligned to the right; Peter explicitly requested removing the caption, count, play/pause button, thumbnails, and visible “Enlarge” label. Arrow navigation loops from the last screenshot to the first and from the first to the last.
- Automatic rotation runs every five seconds while visible. Hover temporarily pauses it; manual browsing, keyboard focus, or enlargement stops it for the rest of the visit. Reduced motion disables automatic rotation by default. Rotation also pauses when the gallery or tab is out of view.
- Clicking a screenshot smoothly enlarges it in place through PhotoSwipe, with the core viewer loaded on demand. This dependency supplies the opening/closing animation and touch gestures without another carousel library. At Peter's explicit request, the enlarged view has no toolbar or buttons: an image/background click, touch tap, or Escape closes it; arrow keys switch screenshots in a continuous loop in either direction. The page stays in place and focus returns to the selected screenshot.
- `tests/gallery.spec.ts` covers consistent image dimensions, manual browsing, rotation and pause behavior, reduced motion, click/tap dismissal, keyboard navigation and focus restoration, native touch swipes, no-JS browsing, and an automated accessibility check of the viewer. The gallery and affected site checks passed in Chromium, Firefox, WebKit, and mobile emulation; browser-specific input tests run only in their applicable projects.

## Primary and supporting information

The home page should quickly explain who Peter is, what problems he solves, what supports those claims, and how to view his work and contact him.

Detailed technologies, constraints, decisions, results, and professional context can be available on demand. Do not hide the main role, value, brief evidence of experience, or contacts behind interactions.

A separate page with its own URL is the recommended format for a full case study. Native disclosure or a modal can work for short supporting information. Choose based on content rather than the desire to add an effect.

## First-version materials and constraints

- The nine named products above form the project list. Ankr Forge is the only project with a separate case page.
- Contacts from the [README](../../README.md): `pamiheevcorp@gmail.com`, https://www.linkedin.com/in/tenshou, https://t.me/peter_mikheev. Confirm they are current before public launch.
- The production domain is `https://themick0.com/`. Do not invent owner details.
- Application stack: Astro SSG, TypeScript, and scoped CSS; add components and dependencies as needed.
- No backend, CMS, database, blog, additional languages, or complex contact form in the first version.
- The home page and Ankr Forge case page are implemented; other products use external links or non-interactive summaries.
- Content and contact actions work without JS. Responsive layout, keyboard access, focus, contrast, and reduced motion are required.
- The prototype is not published publicly. If remote review is needed, `noindex` does not replace restricted access.

## Source priority

1. Peter's latest explicit instructions.
2. Facts he supplied and explicitly approved decisions.
3. This shared context and current-stage outputs with their stated status.
4. The [Cosmos reference](../../concepts/cosmos/index.html), its description, and the [README](../../README.md).

Reviewing an earlier plan does not approve a new design or new copy. Identify conflicting facts; do not choose the stronger marketing claim without evidence.
