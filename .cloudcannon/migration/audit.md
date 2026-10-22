# Audit

Site: tailwind-nextjs-starter-blog v2.4.0. Next.js 15.5.12 App Router, Contentlayer2 0.5.8, Pliny 0.4.1, Tailwind 4, Yarn 3.6.1.

## Checklist

- [x] SSG detected — `npx @cloudcannon/cli configure detect-ssg` → `nextjs` (score 50, all others 0)
- [x] Quick checks run and recorded (below)
- [x] § 1 Router and export readiness, including blockers, versions, `output`, `distDir`, `trailingSlash`, `basePath`, `src/`
- [x] § 1 Earlier CloudCannon setup
- [x] § 2 Content sources, front matter, loader, parser, renderer, MDX setup, components in bodies
- [x] § 3 Pages and routing — every route
- [x] § 4 Layouts and components, server/client split, providers, `next/image`, VE candidates
- [x] § 4 Census table and follow-on censuses
- [x] § 5 Build pipeline
- [x] § 6 Flags and special patterns
- [x] § 7 Sizing evaluated

## Quick checks

- **Router:** `app/` only. No `src/`, no `pages/`.
- **Pages Router checks:** nothing (no Pages Router).
- **Earlier CloudCannon setup:** none — no react-connector, filer, Bookshop, `data-cms-bind`, `.cloudcannon/prebuild|postbuild`, `component-library/`.
- **Next config:** `next.config.js`. `output: process.env.EXPORT ? 'export' : undefined`; `basePath: process.env.BASE_PATH || undefined`; `trailingSlash: true`; `images.unoptimized: process.env.UNOPTIMIZED ? true : undefined`, `images.remotePatterns` for `picsum.photos`; `async headers()` (CSP and security headers on `/(.*)`); no `distDir`, `rewrites`, `redirects`, `i18n`. Wrapped by `withContentlayer` and `@next/bundle-analyzer`. Custom webpack and `turbopack.rules` for `*.svg` via `@svgr/webpack`. `pageExtensions` includes `md`/`mdx` (no `@next/mdx`; no `.md`/`.mdx` route files exist).
- **Middleware/proxy:** none (checked with `find`; the quick-check `ls` glob aborts under zsh when any pattern misses).
- **Server-only features in `app/`:** none (`revalidate`, `"use server"`, `cookies()`, `headers()`, `draftMode`, `dynamicParams`, `force-dynamic` all absent).
- **Route handlers:** `app/api/newsletter/route.ts`.
- **Dynamic routes:** `app/blog/[...slug]`, `app/blog/page/[page]`, `app/tags/[tag]`, `app/tags/[tag]/page/[page]`. All four have `generateStaticParams`.
- **`next/image`:** `components/Image.tsx` (wrapper prefixing `BASE_PATH`), used by `Card`, `AuthorLayout`, `PostLayout`, `PostBanner`, the MDX `Image` component, and markdown images via pliny's `remarkImgToJsx`.
- **Content/data files:** `data/blog/**/*.mdx` (11), `data/authors/*.mdx` (2), `app/tag-data.json` (generated), `data/references-data.bib`. `faq/*.md` and `README.md` are repo docs, not read by the site.
- **Content tooling:** `contentlayer2`, `next-contentlayer2`, `gray-matter` (dependency, not imported by site code), `remark`.
- **Fetches:** none in `app/`.

## 1. Router and export readiness

App Router serves every route. No `src/` directory.

### Export blockers (ask before Phase 2)

- **`app/api/newsletter/route.ts`** — `export const dynamic = 'force-static'`, exports pliny's `NewsletterAPI` (Buttondown provider, `BUTTONDOWN_API_KEY`) as both `GET` and `POST`. Under export the build passes (`ƒ /api/newsletter`, no warning) and `out/api/` is not written. What breaks: `pliny/ui/NewsletterForm` on the home page and `BlogNewsletterForm` in `data/blog/new-features-in-v1.mdx` POST to `/api/newsletter` (pliny's default `apiUrl`), so both forms fail on CloudCannon hosting. Static equivalent: both components take an `apiUrl` prop, so they can point at an external endpoint (provider-hosted form or a function hosted elsewhere); or the form and route are removed. The starter's README recommends removing `api/` and the newsletter components for static builds.
- **`headers()` in `next.config.js`** — CSP, Referrer-Policy, X-Frame-Options `DENY`, X-Content-Type-Options, X-DNS-Prefetch-Control, HSTS, Permissions-Policy. Under export: build warns ("rewrites, redirects, and headers are not applied when exporting") and they don't apply. Static equivalent: `.cloudcannon/routing.json` `headers` rules on CloudCannon hosting. Note: `X-Frame-Options: DENY` and `frame-ancestors`-style CSP would block the Visual Editor iframe if carried across unchanged — the headers must not deny framing by CloudCannon.

Verified by build: `EXPORT=1 UNOPTIMIZED=1 yarn build` exits 0, 60 routes generated, 56 HTML files in `out/`.

### Versions and settings

- Next 15.5.12, React 19.2.4 / react-dom 19.2.4 (editable-regions needs React 18+: ok). `output: "export"` available (≥13.3). Webpack build (Next 15; Turbopack default arrives in 16).
- Node: no `.nvmrc`, `.node-version` or `engines`. `.github/workflows/pages.yml` and `.devcontainer` pin Node 20. Local export build succeeded on Node 24.20.0.
- Package manager: Yarn 3.6.1 (Berry) — `packageManager` field, `.yarnrc.yml` with `nodeLinker: node-modules` and `yarnPath: .yarn/releases/yarn-3.6.1.cjs` (committed). Install verified with `node .yarn/releases/yarn-3.6.1.cjs install --immutable` (warning only: YN0066 typescript patch hunk). A global Yarn 1 binary honours `yarnPath`.
- `output` — **env-gated**: `'export'` only when `EXPORT` is set. `scripts/rss.mjs` (postbuild) writes `feed.xml` and `tags/<tag>/feed.xml` to `out/` when `EXPORT` is set, otherwise to `public/` — after `next build` has already copied `public/`. Hardcoding `output: 'export'` without `EXPORT` set loses every RSS feed from the output.
- `images.unoptimized` — env-gated on `UNOPTIMIZED`.
- `distDir` — unset; output is `out/`.
- `trailingSlash: true` — pages build to `<path>/index.html`; collection URLs end in `/`.
- `basePath` — env-gated on `BASE_PATH` (set by the GitHub Pages workflow). Unset on CloudCannon → served from root. `layout.tsx`, `Image.tsx` and `siteMetadata.js` read `process.env.BASE_PATH` directly.
- `src/` — not used.

### Earlier CloudCannon setup

None.

## 2. Content sources

### Content layer

- Config: `contentlayer.config.ts`, `contentDirPath: 'data'`, output `.contentlayer/` (gitignored, never a collection). Imported as `contentlayer/generated`.
- `onSuccess` writes `app/tag-data.json` (tracked; tag slug → count, drafts excluded in production) and `public/search.json` (kbar index, gitignored).
- Remark: `remarkExtractFrontmatter`, `remark-gfm`, `remarkCodeTitles`, `remark-math`, `remarkImgToJsx` (markdown images → `next/image` with dimensions read from `public/`), `remark-github-blockquote-alert`. Rehype: `rehype-slug`, `rehype-autolink-headings`, `rehype-katex`, `rehype-katex-notranslate`, `rehype-citation` (bib files in `data/`), `rehype-prism-plus`, `rehype-preset-minify`.
- Rendered by `MDXLayoutRenderer` from `pliny/mdx-components`, with the map in `components/MDXComponents.tsx` (`Image`, `TOCInline`, `a`→`Link`, `pre`→`Pre`, `table`→`TableWrapper`, `BlogNewsletterForm`). The about page renders without the map.

### `Blog` — `data/blog/**/*.mdx` (11 files, one in `nested-route/`)

Read by `app/page.tsx`, `app/blog/**`, `app/tags/**`, `sitemap.ts`, `scripts/rss.mjs`. Slug = path under `blog/` (`nested-route/introducing-multi-part-posts-with-nested-routing`); URL `/blog/<slug>/`.

Front matter:
- `title` string, required, always present
- `date` date, required, always present — quoted `'YYYY-MM-DD'` everywhere except one unquoted ISO datetime (`new-features-in-v1.mdx`)
- `tags` list of strings, default `[]`, always present — free text, slugified with `github-slugger` for tag URLs
- `lastmod` date, optional (3 files)
- `draft` boolean, always present — one draft (`my-fancy-title.mdx`)
- `summary` string, optional (present in all 11)
- `images` json — array of image paths (string also handled by code); optional (4 files)
- `authors` list of author slugs, optional (2 files); defaults to `['default']` in code
- `layout` string, optional — `PostLayout` (default), `PostSimple`, `PostBanner`
- `bibliography` string, optional — file name in `data/` (1 file)
- `canonicalUrl` string, optional (0 files)

Computed: `readingTime`, `slug`, `path`, `filePath`, `toc`, `structuredData`.

### `Authors` — `data/authors/*.mdx` (2 files)

Front matter: `name` (required), `avatar`, `occupation`, `company`, `email`, `twitter`, `bluesky`, `linkedin`, `github`, `layout` — all strings, all optional except `name`. Body is the author bio. `default.mdx` builds `/about/`; `sparrowhawk.mdx` builds no page and is only a lookup for post author cards (`PostLayout`).

### Data in code

- `data/siteMetadata.js` (CommonJS, typed as `PlinyConfig`) — title, author, headerTitle, description, language, theme, siteUrl, siteRepo, siteLogo, socialBanner, email, social URLs (github, x, facebook, youtube, linkedin, threads, instagram, medium, bluesky, mastodon), locale, stickyNav, analytics, newsletter, comments (giscus via `NEXT_PUBLIC_*` env), search (kbar). Imported by `layout.tsx`, `Main.tsx`, `seo.tsx`, `sitemap.ts`, `robots.ts`, `Header`, `Footer`, layouts, `contentlayer.config.ts` and `scripts/rss.mjs` (Node ESM).
- `data/headerNavLinks.ts` — `[{ href, title }]`, used by `Header` and `MobileNav`.
- `data/projectsData.ts` — `[{ title, description, href?, imgSrc? }]` (2 items), used only by `app/projects/page.tsx`.
- Text in JSX: home "Latest"; blog/tag listings "All Posts"; "Projects" heading and intro; "Tags" heading; "About" heading in `AuthorLayout`; 404 copy; footer credit "Tailwind Nextjs Theme".

### MDX components in bodies (outside code fences)

| Component            | Props                                                   | Files | Where                                        | Classification            |
| -------------------- | ------------------------------------------------------- | ----- | -------------------------------------------- | ------------------------- |
| `TOCInline`          | `toc={props.toc}` (JS expression), `exclude`, `toHeading`, `asDisclosure` | 2 (3 uses) | near the start (`new-features-in-v1`, `release-…-v2.0`), plus mid-prose | Inline component → snippet |
| `BlogNewsletterForm` | `title`                                                 | 1     | mid-prose (`new-features-in-v1`)             | Inline component → snippet; depends on the newsletter decision |

No layout components in bodies. `Image` appears only inside code fences. `TOCInline` sits near the top in 2 files — below the 3-file threshold for a layout field.

Inline HTML/JSX:
- `pictures-of-canada.mdx` — `<div className=…>` gallery grid wrapping markdown images, and four `<div>` photo-credit blocks.
- `release-of-tailwind-nextjs-starter-blog-v2.0.mdx` — `<video controls><source …/></video>`.

Also in bodies: KaTeX math (3 files), footnotes, GitHub alerts (`> [!CAUTION]`), citations (`[@…]` with `bibliography`), ESM `import`/`export` only inside code fences.

## 3. Pages and routing

Built output (export): 56 HTML files.

- `/` — `app/page.tsx` → `app/Main.tsx`; latest 5 posts from `allBlogs`, `siteMetadata.description`, newsletter form
- `/about/` — `app/about/page.tsx`; `authors/default.mdx` via `AuthorLayout`
- `/projects/` — `app/projects/page.tsx`; `data/projectsData.ts` via `Card`
- `/blog/` — `app/blog/page.tsx`; listing page 1 (5 per page), `ListLayoutWithTags`
- `/blog/page/[page]/` — `app/blog/page/[page]/page.tsx`; pages 1–3
- `/blog/[...slug]/` — `app/blog/[...slug]/page.tsx`; `generateStaticParams` maps every `allBlogs` entry (drafts included) to `slug.split('/')`. Layout chosen by front matter `layout`. Drafts render `notFound()` in production, so `/blog/my-fancy-title/` exports the 404 page.
- `/tags/` — `app/tags/page.tsx`; from `app/tag-data.json`
- `/tags/[tag]/` — 17 tags; `/tags/[tag]/page/[page]/` — 18 paths
- `/api/newsletter` — route handler, not exported (blocker above)
- `sitemap.xml`, `robots.txt` — `force-static` metadata routes; `feed.xml` and `tags/<tag>/feed.xml` — `scripts/rss.mjs`
- `not-found.tsx` → `404.html`

No route groups, catch-all optional routes, parallel or intercepting routes.

## 4. Layouts and components

- **Root layout** `app/layout.tsx` (server): `next/font` Space Grotesk, metadata from `siteMetadata`, favicons with `BASE_PATH`, then `ThemeProviders` (next-themes, client) → pliny `Analytics` → `SectionContainer` → pliny `SearchProvider` (kbar) → `Header`, `<main>`, `Footer`. No nested layouts.
- **Client components:** `app/theme-providers.tsx`, `MobileNav`, `ThemeSwitch`, `Comments`, `ScrollTopAndComment`, `layouts/ListLayout.tsx`, `layouts/ListLayoutWithTags.tsx` (`usePathname`). Everything else is a server component; route files are `async` and read `contentlayer/generated`. No component calls `fetch` or reads files itself; `ListLayoutWithTags` imports `app/tag-data.json`.
- **Post layouts:** `PostLayout` (default; author cards from `authorDetails`, prev/next, edit-on-GitHub link from `siteRepo`, comments), `PostSimple`, `PostBanner` (banner from `images[0]` via `next/image fill`, pliny `Bleed`).
- **Section components:** `Main` (home), `Card` (project card: `title`, `description`, `imgSrc`, `href`), `AuthorLayout` (`content` = author doc), `ListLayoutWithTags` (`posts`, `initialDisplayPosts`, `pagination`, `title`), `PageTitle`, `Tag`.
- **Providers sections depend on:** next-themes (dark mode), kbar `SearchProvider` (`SearchButton` in header).
- **`next/image`:** local `/static/images/...` sources everywhere in content; `remotePatterns` for picsum.photos only. `Image` wrapper prefixes `BASE_PATH`.
- **SVG as component:** `Header` imports `@/data/logo.svg` through `@svgr/webpack` (webpack and turbopack rules both configured).

Visual-editing candidates: home intro, project cards, about (author fields + bio), blog post title/summary/body, listing headings. Sidebar-only: navigation, site settings, social links, comments/analytics/search config.

### Census table

| Page file | Distinct content sections | Layout repeated on other pages? | Editor will add similar pages? | Recommended pattern | Needs editable region? |
| --- | --- | --- | --- | --- | --- |
| `app/page.tsx` (+ `app/Main.tsx`) | intro (heading, description), latest-posts list, newsletter form | No | Maybe (landing pages) | Page builder — `content/pages/index.md` in `pages`, blocks: intro, recent posts (count), newsletter | Yes |
| `app/projects/page.tsx` | intro (heading, description), project card grid | No | Maybe | Page builder — `content/pages/projects.md`, blocks: intro, project grid (`projects[]` from `projectsData.ts`) | Yes |
| `app/blog/page.tsx` (+ `blog/page/[page]`) | heading "All Posts", post list, tag sidebar, pagination | Yes (tag listings) | No | Listing page with editable intro — `content/pages/blog.md`, own schema (`title`) | Yes (title) |
| `app/tags/page.tsx` | heading "Tags", tag cloud; description in metadata | No | No | Listing page with editable intro — `content/pages/tags.md`, own schema (`title`, `description`) | Yes (title) |
| `app/about/page.tsx` | "About" heading, author card, bio body | Shares `AuthorLayout` with no other route | No | Already content — `data/authors/default.mdx` in `authors`; move the "About" heading into a field | Yes (author fields, body) |
| `app/tags/[tag]/page.tsx` (+ `page/[page]`) | generated title, filtered post list | Yes | No (generated from tags) | Leave as code — built from `blog` tags | No |
| `app/blog/[...slug]/page.tsx` | post title, meta, body, author cards | Yes | Yes | Fixed-schema `blog` collection (existing) | Yes (title, summary, body) |
| `app/not-found.tsx` | 404 copy | No | No | Leave as code | No |
| `app/sitemap.ts`, `app/robots.ts`, `scripts/rss.mjs` | — | — | — | Leave as code | No |

Shared UI (per the shared-UI treatment table):
- Header / navigation — `data/headerNavLinks.ts` → a `navigation` data file with `items[]`; `headerTitle` → site data file. Region: yes (data).
- Footer — social links and author/title from `siteMetadata`, theme credit hardcoded → a footer/social data file. Region: yes (data).
- Author cards on posts — the `authors` collection already owns them (MDX files with a body, and `default` builds `/about/`), so they stay a collection with an `authors` select on posts.

### Primitive-vs-computed census

- `app/page.tsx` — `sortPosts`/`allCoreContent` over `allBlogs` (computed). `Main.tsx`: "Latest" literal, `siteMetadata.description` (data import), `posts.slice(0, 5).map` (computed), `siteMetadata.newsletter?.provider &&` (conditional).
- `app/about/page.tsx` — `allAuthors.find(slug === 'default')` (lookup).
- `app/projects/page.tsx` — literal heading and intro, `projectsData.map` (data import).
- `app/blog/page.tsx`, `blog/page/[page]` — pagination math and slicing (computed), "All Posts" literal.
- `app/tags/page.tsx` — `tagData` sort (computed), "Tags" literal.
- `app/blog/[...slug]/page.tsx` — post lookup, prev/next, author lookups, layout map (computed).

Target zero computed values in route files: Phase 3/4 move these into components taking props (recent-posts block takes `count`; post list stays a computed component outside editable regions).

### Frontmatter co-location

- `Card` — one project item: ok once `projects[]` sits under one key.
- `AuthorLayout` — one author doc: ok.
- `Main` — mixes `siteMetadata.description` with posts: reshape into intro block props + recent-posts block.
- `Header`/`Footer` — read the whole `siteMetadata`: reshape to read the new data files.

## 5. Build pipeline

- `build`: `cross-env INIT_CWD=$PWD next build && cross-env NODE_OPTIONS='--experimental-json-modules' node ./scripts/postbuild.mjs`. `withContentlayer` runs Contentlayer inside `next build` (generates `.contentlayer/`, `app/tag-data.json`, `public/search.json`). Postbuild writes RSS (location depends on `EXPORT`).
- Env vars: `EXPORT`, `UNOPTIMIZED`, `BASE_PATH`, `ANALYZE` (build switches); `NEXT_UMAMI_ID`, `NEXT_PUBLIC_GISCUS_*` (client config, unset → comments/analytics inert); `BUTTONDOWN_API_KEY` and other newsletter keys (`.env.example`, server-only — used only by the API route).
- Hosting config: `.github/workflows/pages.yml` (GitHub Pages export with `EXPORT=1 UNOPTIMIZED=1 BASE_PATH=…`). No `vercel.json`/`netlify.toml`. Security headers live in `next.config.js` (see blockers).
- Husky `pre-commit` runs lint-staged (eslint + prettier) — not part of the build.

## 6. Flags and special patterns

- Positional CSS selectors: none in `css/`, components or layouts.
- Global DOM scripts: none (`ScrollTopAndComment` uses `window.scrollTo` in handlers only).
- Numbers displayed as text: none from content (tag counts are computed).
- Styled HTML in strings: none; the only `dangerouslySetInnerHTML` is JSON-LD.
- Scroll-reveal/entrance animations: none.
- Computed in footer: `© ${new Date().getFullYear()}`.

## 7. Sizing

- Total pages: 56 built HTML files, of which 35 are generated tag and tag-pagination pages and 3 blog pagination pages; 16 are content-backed (11 posts, home, about, projects, blog, tags). Threshold >30: tripped on the built count, ok on content-backed pages.
- Hardcoded → YAML conversions: 4 (home, projects, blog listing, tags listing). Threshold >15: ok.
- Distinct collections: 3 (`blog`, `authors`, `pages`), plus data files (navigation, site settings/social). Threshold >5: ok.
- Tripped: at most 1/3 → no `plan.md`.

## Decisions and why

- **SSG is nextjs, App Router only** — CLI detection and the router check agree.
- **Keep Contentlayer and `data/` as the content root** — both collections already live there and every route reads `contentlayer/generated`; editors change `data/blog/**/*.mdx` and `data/authors/*.mdx`. `.contentlayer/` is never a collection.
- **`blog` collection keeps nested folders** — `nested-route/` is a real feature of the starter; the URL is `/blog/<path under blog>/`.
- **`authors` stays a collection, not a data file** — entries have MDX bodies and `default` builds `/about/`; posts reference authors by file slug.
- **Home and projects → page builder in a `pages` collection** — each has 2+ distinct sections and the project owns its layouts (the starter is copied into the repo, not a theme dependency).
- **Blog and tags listings → `pages` entries with their own small schema** — listing pages with an editable intro; the lists themselves stay computed.
- **Tag pages, pagination, 404, sitemap, robots and feeds stay code** — generated from posts.
- **Editor-facing settings leave `siteMetadata.js` for data files; developer settings stay in code** — analytics, comments, search and newsletter provider config read env vars and stay in `siteMetadata.js`.
- **Phase 2 keeps the `EXPORT` switch working** — `scripts/rss.mjs` depends on it; either set `EXPORT=1` (and `UNOPTIMIZED=1`) in the CloudCannon build environment or make `output: 'export'`/`unoptimized` unconditional and change `rss.mjs` to write to `out/` in the same step.
- **Static export via the starter's own recipe is viable** — verified locally: exit 0, all content routes exported.

## Open questions

Blocking (before Phase 2):

1. **Newsletter and security headers.** The `/api/newsletter` route (POST to Buttondown) and `headers()` in `next.config.js` don't run on static hosting. Recommended default: remove the API route and point `NewsletterForm`/`BlogNewsletterForm` at an external endpoint via `apiUrl` if you have one, otherwise remove the forms; move the security headers into `.cloudcannon/routing.json`, dropping `X-Frame-Options: DENY` so the Visual Editor can frame the site.

Non-blocking (default taken):

2. **Node version for CloudCannon** — no `.nvmrc`/`engines`; CI pins Node 20, which is past end of life. Default: `node_version` 24 (the version the local export build passed on); alternatively add an `.nvmrc`.
3. **Home and projects as page builder** — default yes. Alternative: fixed schemas for both, if editors won't add or reorder sections.
4. **Projects data location** — default: `projects[]` inside the projects page's front matter (used on one page only). Alternative: a `projects` data collection if projects will appear elsewhere.
5. **Draft posts** — `/blog/<draft>/` exports a 404 page, so a draft previews as 404 in CloudCannon. Default: leave as is; posts preview once `draft: false`.
6. **GitHub Pages workflow** — default: leave `.github/workflows/pages.yml` untouched; it doesn't affect CloudCannon.
