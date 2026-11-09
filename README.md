# Plurality website

A small Astro information site for `https://plurality.run`. Static HTML/CSS output, with no server adapter, UI framework, database, CMS, analytics, or browser JavaScript on the introductory page.

## Local development

Use Node 24 (the tested version is pinned in `.node-version`) and npm.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

`dist/` is the complete publishable site. It is generated, not committed. In agent shells, Astro may automatically background its dev/preview server; pass `--ignore-lock` for a foreground instance with an externally managed lifecycle.

## Editing and structure

- `src/pages/index.astro`: introductory page copy and composition.
- `src/config/site.ts`: public site metadata, real external links, navigation, and canonical domain.
- `src/styles/tokens.css`: approved palette, semantic colours, typography, spacing, and layout tokens.
- `src/styles/global.css`: shared responsive styling. Use component-scoped CSS for future specialized widgets.
- `src/components/` and `src/layouts/`: shared header, footer, illustration, and page shell.
- `public/brand/`: approved native SVG artwork, generated icons/social card, and font licence.
- `src/widgets/`: guidance for isolated interactive components, without imposing a client framework now.

The outlined Outfit400 logo artwork is preserved, including its shared 78px frame and native paths. Display it with a fixed height and `width: auto`, not an independently trimmed or stretched canvas. Body and headings use self-hosted Source Sans 3 (400/600), with the SIL OFL licence included in the published assets. No visitor requests to a hosted font service are needed.

The navy/copper/rose identity and warm paper surfaces follow the approved Plurality mockup. Copper and rose are decorative accents, not the sole way to communicate a state or a low-contrast body-text colour.

To regenerate the committed PNG favicons and 1200x630 social image after a brand change:

```sh
npx playwright install chromium
npm run assets
```

Normal builds use the committed images and do not need a browser. Metadata uses the intended production domain even in previews; it does not establish that the domain has been connected or the site launched.

## Notes and news

Markdown files in `src/content/updates/` use the schema in `src/content.config.ts`:

```yaml
---
title: A descriptive title
description: A short summary for the homepage and link previews.
published: 2026-11-09
kind: note # or news
draft: true
---
```

Replace the starter draft, or add a new `.md` file with a URL-friendly filename. Set the correct date and explicitly change `draft` to `false` when approving publication. Dates are interpreted in UTC. Future dates and drafts are excluded from the built homepage, article routes, and sitemap. The homepage's updates section appears automatically when the first eligible post exists; there is no empty public blog or invented launch announcement.

A future-dated post becomes eligible on the next build after its date; this is not an automatic publishing scheduler. New posts receive `/updates/<filename>/` URLs. Keep published filenames stable, or add redirects deliberately if moving them. Plain Markdown is intentional; MDX, RSS, pagination, and a CMS can be added when needed.

**This repository and its history are public.** Draft status excludes content from the built site, not from GitHub. Preview URLs are also public by default unless separately protected. Never commit confidential drafts, credentials, private workbench files, or personal data.

## Checks

```sh
npx playwright install chromium
npm run check
npm test
```

The suite covers publication dates/drafts, a real Markdown publication build in a disposable source copy, preview noindex behaviour, responsive layouts from 320 to 1440px, broken images/local links, keyboard skip navigation, metadata, and automated main-document accessibility checks. Browser tests serve the static output with a small development-only server; they do not require an application server in production. Cross-origin frame coverage must be revisited if embeds are added. Automated checks are not a complete accessibility audit.

On a system with an existing compatible Chromium, set `CHROMIUM_EXECUTABLE_PATH`; optional `CHROMIUM_ARGS` is a JSON array of extra launch flags. On tightly constrained containers, bound CPU affinity/native build thread counts rather than increasing service/container limits. Browser dependencies and screenshots are development-only and are not published.

## Cloudflare Pages

Connect **only this repository** through Cloudflare's GitHub integration, under the intended Cloudflare account. This is separate from any agent GitHub App.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | repository root |
| Build command | `npm run check && npm run build` |
| Build output directory | `dist` |
| Node version | `24.18.0` via `NODE_VERSION` / `.node-version` |
| Preview branches | enable the intended non-production branches |

No Cloudflare adapter, Pages Functions, API token, or production secret is required. `_headers` contains basic browser security headers applied by Pages; the local test server does not emulate those platform headers. Preview builds detect `CF_PAGES_BRANCH`, emit `noindex, nofollow`, and disallow crawlers. These are indexing hints, not access controls.

Review the `pages.dev` deployment before attaching `plurality.run`. This repository does not provision a Pages project or change DNS; connecting Git enables automatic deployments.

## Publishing and recovery

Branch -> PR -> preview -> human review/merge -> production deployment. Agents prepare branches/PRs; humans merge. Keep `main` protected and publishable. No release numbers or release branch are needed; the package's `0.0.0` is bookkeeping, not a public product version.

For a bad change, revert it through a PR. If using an immediate Cloudflare deployment rollback, reconcile the repository afterward so the next build does not restore the problem. Commit the lockfile and review dependency updates like other changes.
