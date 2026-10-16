# Product Engineering · DeFi · AI Automation

I help founders and product teams turn complex business needs into **production-ready software** — shaping the solution, designing the architecture, and owning delivery from concept to launch.

With **8+ years in software engineering**, I combine deep experience in DeFi and full-stack development with AI-assisted engineering to build reliable products and accelerate delivery.

*Extending that foundation into AI automation and intelligent workflows.*

[Email](mailto:pamiheevcorp@gmail.com) · [LinkedIn](https://www.linkedin.com/in/tenshou) · [Telegram](https://t.me/peter_mikheev)

---

## Website development

A landing page built with **Astro SSG + TypeScript**, based on [Cosmos](concepts/cosmos/index.html). The home page, two project overviews, and a 404 page are rendered as static HTML. Copy, navigation, and contacts work without JavaScript. JS enhances the decorative scene and project highlights.

### Getting started

Requires Node.js **22.22+** and pnpm **10.33.0** (pinned in `packageManager`). The Node version is specified in `.nvmrc`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the address printed by Astro (usually `http://localhost:4321`). To check the built site:

```sh
pnpm build
pnpm preview
```

`build` runs type checks, builds the site, and validates the output. Deploy **only `dist/`**. The reference prototype in `concepts/cosmos/` and AI instructions in `ai/` are excluded from the build.

### Project structure

| Path | Purpose |
| --- | --- |
| `src/pages/index.astro` | Home page section order |
| `src/components/` | Sections with scoped CSS; shared Header, Footer, and Seo |
| `src/layouts/BaseLayout.astro` | HTML document, metadata, skip link, and footer |
| `src/data/profile.ts` | Name, positioning, contacts, and profiles |
| `src/data/projects.ts` | The `Project` type and verified project copy |
| `src/pages/projects/[slug].astro` | Shared template for project pages |
| `src/scripts/cosmos.ts` | Canvas renderer: stars, comets, camera, and motion lifecycle |
| `src/styles/global.css` | Tokens, base typography, shared classes, and accessibility modes |
| `site.config.mjs` | Domain, base path, and indexing policy shared by the build and validator |
| `scripts/validate-build.mjs` | Validation of generated HTML, links, SEO, and assets |
| `tests/site.spec.ts` | Browser scenarios and axe checks |
| `deploy/` | Nginx configuration and server setup instructions |
| `scripts/deploy.sh` | SSH upload and atomic release activation |
| `ai/roles/` | Role instructions and shared project context |
| `ai/rules/` | Repository rules |

Add an entry to `projects.ts` to create a project listing and static route automatically. Each `slug` must be unique and lowercase; choose either `atom` or `orbit` for the symbol. Contributions, results, and approach sections are optional. Longer case studies can move to Markdown when the content requires it.

Section styles live alongside their markup. Colors and container sizes are defined in `global.css`. The current content does not require a client UI framework, CMS, server, or animation library. System fonts avoid external requests.

### SEO and deployment

Copy `.env.example` to `.env`. For local development, leave `SITE_URL` empty and `SITE_INDEXABLE=false`. Local and preview builds use `noindex, nofollow` and omit the sitemap. `noindex` does not restrict access to the site.

Before building for public deployment, set `SITE_URL=https://themick0.com/` and `SITE_INDEXABLE=true`, then run `pnpm build`. CI environment variables take precedence over `.env`. The domain is not inferred from the repository name. Invalid settings and indexable builds without a domain fail validation.

For Nginx hosting with automatic deployment from GitHub, follow the [server setup guide](deploy/README.md). Configure the `production` GitHub environment before running the workflow on `main`.

- Each page has its own title and description, one H1, and a canonical URL without a query or fragment.
- Open Graph and Twitter Card metadata use absolute URLs and a 1200×630 PNG.
- JSON-LD describes Person, WebSite, and WebPage entities; project pages include BreadcrumbList. Data matches the visible copy without invented ratings or achievements.
- The sitemap is generated from Astro routes, excluding the 404 page. robots.txt references the sitemap. Preview pages remain crawlable so search engines can read `noindex`.
- Subdirectory hosting is supported: the path in `SITE_URL` is applied to links and assets. Search engines read **robots.txt only at the domain root**, so the hosting owner must configure that file when deploying under a subdirectory.
- The server must return an actual HTTP 404 for missing URLs and display `404.html`. Do not redirect every unknown URL to the home page with a 200 status.

After deployment, verify actual HTTP status codes, HTTPS, redirects to a single domain, sitemap availability, and the absence of `noindex` or `X-Robots-Tag: noindex` in production. Submit the sitemap to Google Search Console, Bing Webmaster Tools, and Yandex Webmaster as needed. Technical preparation supports crawling but does not guarantee indexing or rankings.

These decisions follow [Astro site/base configuration](https://docs.astro.build/en/guides/configuring-astro/), the [official sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/), and [Google's robots meta guidance](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

### Checks

```sh
pnpm check             # Astro and TypeScript
pnpm build             # Types, build, HTML, SEO, and links
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test              # Chromium, Firefox, WebKit, and mobile profiles
pnpm format:check
```

Browser scenarios cover widths from 320 to 1920 px, 200% text size, keyboard navigation, project links, disabled JS/Canvas, reduced motion, and pausing Canvas rendering outside the viewport. Axe runs on all pages. Automated checks do not replace screen reader testing or physical devices; Playwright WebKit is not Safari on an actual iPhone.

GitHub Actions checks the preview build and separately validates production metadata using a test domain and subdirectory. On `main`, successful validation is followed by a fresh production build using the configured real domain and an SSH deployment to Nginx. Pull requests and other branches only run validation. To check production settings locally, use your real domain in `.env`.

Browser test output is written to `playwright-report/` and `test-results/` (ignored by Git). `pnpm format` formats application code and configuration, excluding reference prototypes.

### Motion and images

The scene follows Cosmos: an opening sequence, perspective flight, comets, and gentle pointer response. Canvas resolution and frame rate are capped, with a lighter mode for touch devices. Rendering stops for reduced motion, hidden tabs, and an offscreen scene. Without JS/Canvas, a static CSS composition remains. Main content is visible before scripts run.

`src/assets/social-preview.svg` and `public/favicon.svg` are editable sources. After changing them, run `pnpm assets` and commit the generated PNG files. Normal builds use the existing assets and do not depend on system fonts to generate them.

Verified facts and the scope of public project overviews are documented in the [shared context](ai/roles/00-context.md); project copy lives in [projects.ts](src/data/projects.ts). Detailed measurement conditions for the Davos RPC metric and additional case study materials have not been provided. The implementation preserves the approved short overviews.

### AI instructions

[AGENTS.md](AGENTS.md) points to the repository rules. All content in repository files must be in English, as defined in the [language rule](ai/rules/repository-language.md). Conversation with the user may follow their preferred language.

[ai/roles](ai/roles/README.md) contains the shared context and role instructions for content, design, frontend engineering, and review. [ai/rules](ai/rules/) contains rules that apply across those roles.
