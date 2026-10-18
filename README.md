# Product Engineering · DeFi · AI Automation

I help founders and product teams turn complex business needs into **production-ready software** — shaping the solution, designing the architecture, and owning delivery from concept to launch.

With **8+ years in software engineering**, I combine deep experience in DeFi and full-stack development with AI-assisted engineering to build reliable products and accelerate delivery.

*Extending that foundation into AI automation and intelligent workflows.*

[pamiheevcorp@gmail.com](mailto:pamiheevcorp@gmail.com) · [LinkedIn](https://www.linkedin.com/in/tenshou) · [Telegram](https://t.me/peter_mikheev)

## Website development

Use Node and pnpm versions from `package.json`. Run `pnpm dev` to start the site, `pnpm build` to generate and validate `dist/`, and `pnpm preview` to inspect the build. Run `pnpm format:check`, `pnpm test:cv` and `pnpm test` for formatting, CV sync checks and browser checks.

## CV publishing

The public Google document configured in `cv.config.mjs` is the source for `/cv/` and `/cv.pdf`. Edit the document, then run **Build and deploy portfolio** manually in GitHub Actions on `main`, or use the next normal deployment. Editing Google Docs alone does not trigger a deployment.

`pnpm build` and `pnpm dev` export the current text and PDF before starting Astro. `pnpm sync:cv` refreshes the local exports separately. The ignored `.generated/cv/` directory contains both files; it is recreated from the public document on a clean checkout. Network access and anonymous document export must remain available. No Google credentials are required for this public source. Failed or invalid exports stop the command instead of publishing stale or empty content. The deployed site serves static files and does not contact Google when a visitor opens the CV.

The HTML page preserves the exported wording and generates headings and bullet lists. Keep recognizable section titles in the source: Summary or Profile, Technical Skills or Skills, Experience (also Professional Experience or Work Experience), Education, Languages, Certifications and Projects. Experience entries use `Company | Role` on their own line. Unknown text is retained as a paragraph. The PDF preserves the document's original formatting and hyperlinks.
