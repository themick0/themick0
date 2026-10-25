# Shared project context

Updated: October 18, 2026. Peter's latest instructions take precedence.

This document covers the public website and its maintenance. Optional local working notes are handled according to [AGENTS.md](../AGENTS.md); they are not required to build or maintain the application.

## Person and purpose

- **Peter Mikheev**, **themick0**, **Senior Software Engineer**.
- The website supports employment opportunities and project collaboration with founders, product teams, engineering leaders, and recruiters.
- The home page presents **Full-Stack Engineering**, **DeFi Solutions**, and **AI Automation**.
- Public experience includes more than eight years in software engineering, React, TypeScript, Node.js, backend APIs, SDKs, and production DeFi, wallet, and identity integrations.
- Profile details, contacts, and the CV link live in [src/data/profile.ts](../src/data/profile.ts). Project descriptions and destinations live in [src/data/projects.ts](../src/data/projects.ts).

## Content rules

- Preserve current copy unless the task includes a content change. Keep supporting details concise and avoid repeating the same message across sections.
- Describe personal contributions accurately. Distinguish development, integration, and ownership of a complete system.
- Base additions on confirmed facts. Do not invent experience, projects, decisions, clients, testimonials, metrics, audits, or business results.
- Keep metrics tied to the specific measurement they describe; do not extrapolate them to unrelated outcomes.
- Separate a service offer from evidence of completed work. A proposal is not a completed project or an approved decision.
- Use current public sources and the owner's clarifications when a fact is missing. Do not infer personal preferences, availability, or employment terms.
- Keep conversation history and personal working notes outside tracked documentation. Repository files follow the [English language rule](rules/repository-language.md).

## Application and sources

The application uses Astro static rendering, TypeScript, scoped CSS, and pnpm. Its Cosmos visual style uses dark backgrounds, large typography, cool blue and lavender accents, and decorative space imagery. The current implementation in `src/` is the design reference.

| Area | Source |
| --- | --- |
| Home page and layout | `src/pages/index.astro`, `src/layouts/BaseLayout.astro` |
| Profile and project content | `src/data/profile.ts`, `src/data/projects.ts` |
| Project pages | `src/pages/projects/[slug].astro` |
| Shared gallery and viewer | `src/components/ProjectGallery.astro`, `src/scripts/project-gallery.ts` |
| Scene and decorative motion | `src/scripts/cosmos.ts`, `src/components/StarCluster.astro`, `src/components/DestroyerArrival.astro` |
| Shared styles | `src/styles/global.css` |
| Build and checks | `package.json`, `scripts/validate-build.mjs`, `tests/` |
| Deployment | `.github/workflows/ci.yml`, `scripts/deploy.sh` |

The production domain is `https://themick0.com/`. Deployment uses GitHub Actions and Nginx. `SITE_URL` and `SITE_INDEXABLE` control URL generation and indexing settings. A preview's `noindex` setting is not access control.

## Page structure and navigation

- Home page order: Senior Software Engineer introduction, My work, About, and Let's talk. Contacts and the CV remain available as ordinary links.
- The header star, name, and handle form one home link and one keyboard stop. Header social links use icons with accessible names and touch targets of at least 44 px. The footer name links home; its handle links to GitHub.
- A normal View projects activation scrolls to My work and moves keyboard focus there without adding a fragment or history entry. It clears an existing fragment while preserving the path and query. The native `href` and section IDs remain for direct links, modified clicks, and navigation without JavaScript.
- The project list initially shows Ankr Forge, Neuraverse, and Davos Protocol. More projects reveals the remaining entries and moves focus to the first newly revealed project without scrolling. Direct project anchors reveal their targets; all entries remain available without JavaScript and when printing.
- The complete project order is Ankr Forge, Neuraverse, Davos Protocol, MAT Stake, Swirl, Staking Circle, Inception LRT, Ankr Staking, and Ankr Automate.
- Forge and Neuraverse have local case pages. Other projects use their configured external destinations or plain, non-interactive summaries. Optional `caseStudy` data controls page generation and takes priority over an external website link.
- Internal links stay in the same tab. External web links open in a new tab with `noopener noreferrer`; social links also retain `rel="me"`. Email uses an ordinary `mailto:` link. Preserve Cloudflare `email_off` comments around the public email.
- View CV opens the local `/cv/` page in the same tab. The static page and `/cv.pdf` are exported from the public document in `cv.config.mjs` before development and build commands. The HTML export preserves labeled links in introductory lines, experience headings, paragraphs and bullets; rendering uses text and safe HTTP, HTTPS, email and telephone links without importing Google markup or styles. Add links in Google Docs using its normal link editor. Generated files live in ignored `.generated/cv/`; no private working notes are inputs. Export failure stops the build. A document edit takes effect at the next deployment, including the existing manual GitHub Actions workflow. `pnpm sync:cv` refreshes the local export.
- Case-study arrows move right on hover; external-link arrows move diagonally upward and right. Links do not gain underlines on hover.

## Case pages

Forge introduces the rewards platform, followed by a gallery and three contribution blocks named Identity service, Smart wallet, and Frontend app. The Implementation and validation section below them describes the replacement of an external identity and wallet provider, Peter's implementation work, and the delivery and validation process in separate paragraphs.

Neuraverse describes the React/CSS game-layer rebuild with Pixi.js and its production release in two weeks. Its introduction is followed by a full-width gallery containing a gameplay recording and eight screenshots. The supplemental external link is labeled Neura website.

Davos remains a home-page summary of the stablecoin web app and the reduction from 300–400 to 50–60 RPC requests per dashboard load through request deduplication and caching of static contract data.

Use the typed project data for exact public wording, image descriptions, and destinations. Media illustrates the interface; it does not establish additional project ownership or functionality.

## Galleries and media

- Screenshots use matching 16:9 frames inline and enlarged. Astro produces optimized WebP images; captions and alt text describe the supplied interfaces.
- Galleries support native horizontal scrolling, swipes, previous/next controls, and keyboard arrows. The scrollbar has a thin blue-gray thumb over a transparent track, with a subdued hover state.
- Forge rotates images every five seconds while visible. Hover pauses rotation temporarily; manual browsing, keyboard focus, or enlargement stops it for the visit. Reduced motion disables automatic rotation, and hidden galleries or tabs pause it.
- PhotoSwipe loads on demand for enlargement. Image/background clicks, touch taps, and Escape close the viewer; keyboard arrows loop through slides. Focus returns to the selected slide and the background is inert while the viewer is open.
- Neuraverse uses manual slide navigation and a silent, approximately 69-second, 1080p H.264 MP4 with faststart. Original media belongs outside the public build in ignored local storage.
- Muted inline video autoplay starts on page initialization, subject to browser policy and reduced-motion preferences. Native controls remain usable when autoplay is blocked. Leaving the video slide or hiding the tab pauses playback; returning resumes it unless the visitor paused manually. Scrolling alone does not pause it.
- Enlargement moves the same video element into the viewer and back to preserve playback position. Gallery arrow handling prevents simultaneous native video seeking while leaving the timeline usable. Editable fields and modified shortcuts retain their normal behavior.
- Keep the bounded recovery for a buffered video stall; do not retry blocked autoplay or override manual pause. Browser-specific behavior and coverage are documented in the gallery tests.

## Responsive layout, motion, and accessibility

- On phones, the opening fills at least the first screen including the header. Its measured height remains stable during browser toolbar changes and adapts when the viewport width changes. Only a positive computed height can be frozen; initialization is retried after page load so delayed stylesheets cannot lock the opening to zero height, including when arriving through a project anchor. Content can grow for enlarged text or short viewports.
- The mobile header name and handle use a compact line height and a 4 px gap between their text rows. Preserve the shared home link, readable spacing, and mobile social controls.
- About text has no background or shadow backing so the decorative ships remain visible beneath it. Decoration stays behind readable, interactive content and must not create horizontal overflow.
- Keyboard focus uses a subdued blue-gray outline with a short fade-in. Reduced motion shows focus immediately; forced-color mode uses the system highlight.
- Decorative motion respects reduced motion, offscreen visibility, and background tabs. Content and essential navigation remain available with JavaScript disabled or Canvas unavailable.
- Preserve keyboard access, focus restoration, touch targets, contrast, enlarged text, and layout across phone, tablet, and desktop widths.

## Validation and scope

Use the scripts in [package.json](../package.json): `pnpm dev`, `pnpm format:check`, `pnpm build`, and `pnpm test`. The build runs Astro diagnostics and validates static HTML, links, headings, metadata, structured data, and assets. Browser tests use Chromium, Firefox, WebKit, and mobile emulation; emulation is not physical-device testing.

Run checks appropriate to the change and report actual results. Earlier successful runs do not establish that a later revision passes. Documentation-only changes do not require repeating unrelated browser scenarios.

Keep local notes outside `public/`, imports, generated assets, and deployment output. The application must build from a clean checkout without optional local files. Local edits do not authorize publication, external messages, or history rewrites.
