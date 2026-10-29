# Phase 1 — Audit

Site: `tailwind-nextjs-starter-blog` v2.4.0. SSG: Next.js (App Router), content via contentlayer2. Detected with `npx @cloudcannon/cli configure detect-ssg`.

## Checklist

- [x] Quick checks run and recorded (§ Quick checks)
- [x] § 1 Router and export readiness, incl. versions, package manager, `output`, `distDir`, `trailingSlash`, `basePath`, `src/`
- [x] § 1 Earlier CloudCannon setup
- [x] § 2 Content sources: content folders, front matter, loader, parser, renderer
- [x] § 2 MDX setup and components used in bodies; content layer config
- [x] § 2 Data files and content in code
- [x] § 3 Pages and routing: every route
- [x] § 4 Layouts and components, server/client split, providers, `next/image`
- [x] § 4 Classifying static pages: census table + primitive-vs-computed + frontmatter co-location
- [x] § 5 Build pipeline, env vars, hosting config
- [x] § 6 Flags and special patterns, load-time behaviour
- [x] Shared rules: site-wide facts, forms, markdown-extension syntax, components at fixed points, shared-UI table
- [x] § 7 Sizing evaluated

## Quick checks (output)

Run from the site root.

- **Router:** `app` only. No `pages/`, no `src/`.
- **Pages Router blockers / `pages/api`:** none (no Pages Router).
- **Earlier CloudCannon setup:** none. No `@cloudcannon/*` or `@bookshop/*` deps, no `CloudCannonConnect` / `data-cms-bind` / `_bookshop_name`, no `.cloudcannon/prebuild|postbuild`, no `component-library/`.
- **Next config** (`next.config.js`):
  ```
  4:  enabled: process.env.ANALYZE === 'true',
  57:const output = process.env.EXPORT ? 'export' : undefined
  58:const basePath = process.env.BASE_PATH || undefined
  59:const unoptimized = process.env.UNOPTIMIZED ? true : undefined
  67:    output,
  68:    basePath,
  70:    trailingSlash: true,
  75:          loaders: ['@svgr/webpack'],
  81:    images: {          (remotePatterns: https://picsum.photos)
  88:      unoptimized,
  90:    async headers() {   (security headers on '/(.*)')
  ```
- **Middleware/proxy:** none.
- **Server-only features:**
  ```
  next.config.js:90:    async headers() {
  app/blog/page.tsx:10:export default async function BlogPage(props: { searchParams: Promise<{ page: string }> }) {
  ```
- **Route handlers and metadata routes:** `app/robots.ts`, `app/sitemap.ts`, `app/api/newsletter/route.ts`. `grep -L force-static` on them: none listed (all three export `dynamic = 'force-static'`).
- **Server-rendered routes** (`yarn run build`, unchanged, exit 0): only `ƒ /api/newsletter`.
- **Dynamic routes:** `app/blog/[...slug]`, `app/tags/[tag]`, `app/blog/page/[page]`, `app/tags/[tag]/page/[page]`. `grep -L generateStaticParams`: none listed (all four have it).
- **`next/image`:** `components/Image.tsx`.
- **Content and data files:** `data/blog/*.mdx` (10) + `data/blog/nested-route/*.mdx` (1), `data/authors/*.mdx` (2), `faq/*.md` (3), `app/tag-data.json` (generated), `jsconfig.json`.
- **Content tooling:** `contentlayer2` 0.5.8, `next-contentlayer2` 0.5.8, `gray-matter` ^4.0.3, `remark` ^15.0.1.
- **Fetches:** none in `app/`.

Extra evidence: a build with the repo's own GitHub Pages env (`EXPORT=1 UNOPTIMIZED=1 yarn run build`, no source change) exits 0, lists `ƒ /api/newsletter`, and writes no `out/api/` — the newsletter endpoint is silently left out of the export.

## 1. Router and export readiness

App Router only, routes at `app/` (no `src/`).

### Export blockers (need the user before Phase 2)

- **`app/api/newsletter/route.ts`** — exports `pliny/newsletter`'s `NewsletterAPI` as `GET` and `POST`, provider `buttondown` (`siteMetadata.newsletter.provider`), API key from `BUTTONDOWN_API_KEY`. Marked `ƒ` by the build. The `POST` handler is left out of the export with no warning (confirmed above).
  - Callers: `app/Main.tsx` renders `pliny/ui/NewsletterForm` on the home page whenever `siteMetadata.newsletter.provider` is set; `components/MDXComponents.tsx` maps `BlogNewsletterForm`, used once in `data/blog/new-features-in-v1.mdx`. Both pliny components default `apiUrl = "/api/newsletter"` and post JSON `{ email }` expecting a JSON reply.
  - UI that breaks without it: both subscribe forms submit to a 404.
  - Static equivalent: none that keeps the pliny forms working as-is. See Open questions Q1 (blocking).

### Non-blockers (Phase 2 fixes)

- `next/image` default loader (`components/Image.tsx`, remote pattern `picsum.photos`) — Phase 2 sets `images.unoptimized`. The config already supports `UNOPTIMIZED=1`.
- `robots.ts`, `sitemap.ts` already `force-static`.
- `headers()` in `next.config.js` (CSP, `X-Frame-Options: DENY`, HSTS, etc.) — doesn't apply under export. If CloudCannon hosts production they move to `.cloudcannon/routing.json`; Phase 2 must check that `X-Frame-Options: DENY` and the CSP don't stop the Visual Editor framing or scripting the site before carrying them over.
- `app/blog/page.tsx` declares `searchParams` in its props type but never reads it (`pageNumber = 1`). The build marks `/blog` static and the export build passes, so it is not a blocker. Phase 2 may drop the unused prop.

### Versions and settings

- Next `15.5.12` (≥ 13.3, export supported; webpack build, not Turbopack). React / React DOM `19.2.4` (≥ 18, editable-regions OK).
- Node: no `.nvmrc`, `.node-version` or `engines`. `.github/workflows/pages.yml` uses Node 20. Local build ran on Node 24.22.1.
- Package manager: Yarn Berry `3.6.1` (`packageManager` + `.yarnrc.yml` `yarnPath: .yarn/releases/yarn-3.6.1.cjs`, `nodeLinker: node-modules`). No global `yarn` on this machine; run via `node .yarn/releases/yarn-3.6.1.cjs` or corepack.
- `output`: gated on `process.env.EXPORT` (unset by default).
- `distDir`: unset (`.next`, export to `out/`).
- `trailingSlash: true` — every page builds to `<path>/index.html`; collection URLs end in `/`.
- `basePath`: `process.env.BASE_PATH` (set only by the GitHub Pages workflow). `siteMetadata.siteLogo`, `socialBanner`, `search.json` path, favicons and `components/Image.tsx` also prefix `BASE_PATH`. Leave unset on CloudCannon.
- `pageExtensions` includes `md`/`mdx`, but no route files are `.md`/`.mdx`.

### Earlier CloudCannon setup

None found.

## 2. Content sources

Content layer: **contentlayer2** (`contentlayer.config.ts`), `contentDirPath: 'data'`, output `.contentlayer/` (gitignored; never a collection). Wired into Next via `withContentlayer` in `next.config.js`, so it runs inside `next build`. `onSuccess` writes `app/tag-data.json` (tracked) and `public/search.json` (gitignored). Routes import `allBlogs` / `allAuthors` from `contentlayer/generated`.

Markdown pipeline (contentlayer `mdx`):
- remark: `pliny` `remarkExtractFrontmatter`, `remarkCodeTitles`, `remarkImgToJsx` (markdown images → `<Image>` with size read from `public/`), `remark-gfm`, `remark-math`, `remark-github-blockquote-alert`.
- rehype: `rehype-slug`, `rehype-autolink-headings` (prepends a link icon), `rehype-katex` + `rehype-katex-notranslate`, `rehype-citation` (bib at `data/references-data.bib`), `rehype-prism-plus`, `rehype-preset-minify`.
- Rendered with `pliny/mdx-components` `MDXLayoutRenderer` and the component map in `components/MDXComponents.tsx`: `Image`, `TOCInline`, `BlogNewsletterForm`, and overrides `a` → `CustomLink`, `pre` → `Pre`, `table` → `TableWrapper`.
- `gray-matter` is a dependency but not used by the app's routes (contentlayer parses front matter).

### Collection: `blog` — `data/blog/**/*.mdx` (11 files, one nested: `nested-route/introducing-multi-part-posts-with-nested-routing.mdx`)

Document type `Blog`. Slug = `flattenedPath` with the first segment removed (`blog/nested-route/x` → `nested-route/x`), so URLs are `/blog/<path under data/blog>/`.

Front matter:

| Key | Type | Present | Read by |
| --- | --- | --- | --- |
| `title` | string, required | 11/11 | layouts, listings, metadata, RSS, sitemap |
| `date` | date, required | 11/11 (10 quoted `'YYYY-MM-DD'`, 1 bare ISO timestamp in `new-features-in-v1.mdx`) | layouts, listings, sort, RSS |
| `tags` | list of string, default `[]` | 11/11 | `Tag`, listings, tag pages, `tag-data.json` |
| `lastmod` | date | 2/11 | metadata, sitemap |
| `draft` | boolean | 11/11 (`my-fancy-title.mdx` is `true`) | `allCoreContent` filters drafts in production |
| `summary` | string | 11/11 (one multi-line plain scalar) | listings, metadata, RSS |
| `images` | json (string or list) | 4/11 (one `[]`) | metadata/OG, `PostBanner` |
| `authors` | list of string (author slugs) | 2/11; default `['default']` in code | post layouts via `allAuthors` lookup |
| `layout` | string: `PostLayout` (default) / `PostSimple` / `PostBanner` | 2/11 | `app/blog/[...slug]/page.tsx` layout map |
| `bibliography` | string (path under `data/`) | 1/11 | `rehype-citation` |
| `canonicalUrl` | string | 0/11 | declared only |

Computed (not editor fields): `readingTime`, `slug`, `path`, `filePath` (used by "View on GitHub"), `toc`, `structuredData`.

### Collection: `authors` — `data/authors/*.mdx` (2 files)

Document type `Authors`. Slug = file name (`default`, `sparrowhawk`). MDX body = bio.

| Key | Type | Present | Read by |
| --- | --- | --- | --- |
| `name` | string, required | 2/2 | `AuthorLayout`, post layouts, JSON-LD |
| `avatar` | string (public path) | 2/2 | `AuthorLayout`, post layouts |
| `occupation` | string | 2/2 | `AuthorLayout` |
| `company` | string | 2/2 | `AuthorLayout` |
| `email` | string | 1/2 | `AuthorLayout` |
| `twitter` | string (URL) | 2/2 | `AuthorLayout`, post layouts |
| `linkedin` | string (URL) | 2/2 | `AuthorLayout` |
| `github` | string (URL) | 1/2 | `AuthorLayout` |
| `bluesky` | string | 0/2 | `AuthorLayout` |
| `layout` | string | 0/2 | declared only |

`default.mdx` backs `/about`; both are looked up for author cards on posts.

### MDX components and inline HTML in bodies (outside code fences)

| Component / HTML | Props | Files | Classification |
| --- | --- | --- | --- |
| `TOCInline` | `toc={props.toc}` (JS expression), `exclude`, `toHeading`, `asDisclosure` | 2 files, 3 uses (`new-features-in-v1`, `release-of-…-v2.0`), at the start of the body | Inline component → snippet |
| `BlogNewsletterForm` | `title` | 1 (`new-features-in-v1`) | Inline component → snippet; depends on Q1 |
| `<video controls><source …/></video>` | `src`, `type` | 1 (`release-of-…-v2.0`) | Inline HTML → raw snippet |
| Gallery `<div className=…>` grid wrapping markdown images | `className` | 1 (`pictures-of-canada`) | Inline layout HTML → raw snippet |
| Photo-credit `<div>` wrappers around markdown | none | 1 (`pictures-of-canada`) | Inline HTML → raw snippet |

Every other JSX tag, `import` and `export` in content sits inside code fences (documentation samples). No body is mostly layout components, so no content file joins the census. No component sits at the same point in 3+ files (`TOCInline` at the top of 2), so there are no layout-field candidates.

### Markdown-extension syntax

Plugins adding syntax: `remark-gfm` (footnotes, tables), `remark-math` + KaTeX, `rehype-citation`, `remark-github-blockquote-alert`.

| Form | Files |
| --- | --- |
| Footnotes `[^` | `deriving-ols-estimator`, `github-markdown-guide`, `release-of-…-v2.0`, `new-features-in-v1` |
| Display math `$$` (incl. one-line) | `deriving-ols-estimator` |
| Inline math | `deriving-ols-estimator` |
| Escaped dollar `\$` | `deriving-ols-estimator` |
| `&dollar;` | `deriving-ols-estimator` |
| Citations `[@` | `new-features-in-v1` |
| Alerts `> [!` | `introducing-tailwind-nextjs-starter-blog` |

Treatment default in Decisions; see Q4.

### Data files and content in code

| Source | Holds | Read by | Editor-facing? |
| --- | --- | --- | --- |
| `data/siteMetadata.js` (CommonJS, uses `process.env`) | Site title, author, headerTitle, description, siteUrl, email, social URLs, locale, `stickyNav`; plus developer config: analytics, newsletter provider, comments (giscus via env), search (kbar) | Root layout metadata, Header, Footer, Main, contentlayer config, RSS, many components | Mixed: text and social links yes; provider config no |
| `data/headerNavLinks.ts` | Nav items `{ href, title }` ×5 | `Header`, `MobileNav` | Yes |
| `data/projectsData.ts` | Projects `{ title, description, href?, imgSrc? }` ×2 (like-shaped) | `app/projects/page.tsx` only | Yes |
| `data/logo.svg` | Logo, imported as an SVGR component | `Header` | Static import; see Q6 |
| `data/references-data.bib` | Bibliography | `rehype-citation` | Developer content |
| `app/tag-data.json` | Tag counts, regenerated each build | Tag pages, `ListLayoutWithTags`, RSS | No (generated) |
| `faq/*.md` (3) | Template docs, not read by contentlayer or any route | — | No; not a collection |

Hard-coded text in JSX: home h1 "Latest" (`app/Main.tsx`), projects h1 "Projects" + intro paragraph (`app/projects/page.tsx`), "About" h1 (`layouts/AuthorLayout.tsx`), "All Posts" (`app/blog/*`, `ListLayoutWithTags`), "Tags" (`app/tags/page.tsx`), footer credit link "Tailwind Nextjs Theme" (`components/Footer.tsx`), 404 copy (`app/not-found.tsx`), layout labels ("Previous", "Next", "View on GitHub", "Tags", "Read more", "Load Comments").

Fetches: none. `projectsData` is the only like-shaped data and is not duplicated elsewhere.

## 3. Pages and routing

| Route file | URL(s) | Content source | Kind |
| --- | --- | --- | --- |
| `app/page.tsx` → `app/Main.tsx` | `/` | All blogs (latest 5), `siteMetadata.description`, hard-coded "Latest" | Static route (home) |
| `app/about/page.tsx` | `/about/` | `data/authors/default.mdx` via `AuthorLayout` | Static route, collection-backed |
| `app/projects/page.tsx` | `/projects/` | `data/projectsData.ts` + hard-coded heading/intro | Static route |
| `app/blog/page.tsx` | `/blog/` | All blogs, page 1 | Listing |
| `app/blog/page/[page]/page.tsx` | `/blog/page/1/`–`/blog/page/3/` | `generateStaticParams` from `allBlogs.length / 5` | Pagination |
| `app/blog/[...slug]/page.tsx` | `/blog/<slug>/` ×11 (incl. nested `nested-route/…` and the draft) | `allBlogs`; `generateStaticParams` = every blog slug split on `/` | Dynamic catch-all, `blog` collection |
| `app/tags/page.tsx` | `/tags/` | `app/tag-data.json` | Taxonomy listing |
| `app/tags/[tag]/page.tsx` | `/tags/<tag>/` ×17 | `generateStaticParams` from `tag-data.json` keys | Taxonomy |
| `app/tags/[tag]/page/[page]/page.tsx` | `/tags/<tag>/page/<n>/` ×18 | `tag-data.json` counts | Taxonomy pagination |
| `app/not-found.tsx` | 404 | Hard-coded | Special |
| `app/sitemap.ts` | `/sitemap.xml` | `allBlogs` + fixed list | Generated, `force-static` |
| `app/robots.ts` | `/robots.txt` | `siteMetadata` | Generated, `force-static` |
| `app/api/newsletter/route.ts` | `/api/newsletter` | pliny `NewsletterAPI` | `ƒ` — export blocker (Q1) |
| `scripts/rss.mjs` (postbuild) | `/feed.xml`, `/tags/<tag>/feed.xml` | `.contentlayer/generated`, `tag-data.json` | Generated after `next build` into `out/` when `EXPORT` is set, else `public/` |

No route groups, no intercepting routes, no `[[...slug]]`.

Draft note: `my-fancy-title.mdx` (`draft: true`) is in `generateStaticParams`, but production filters drafts, so `/blog/my-fancy-title/` renders the not-found UI. Its Visual Editor preview will show the 404 view.

## 4. Layouts and components

- **Root layout** `app/layout.tsx`: fonts, favicons, metadata (`title.template = '%s | <title>'`); wraps `ThemeProviders` (next-themes) → `Analytics` (pliny, umami via env) → `SectionContainer` → `SearchProvider` (pliny kbar, loads `/search.json`) → `Header`, `<main>`, `Footer`. No nested layouts.
- **Post layouts** (`layouts/PostLayout.tsx` default, `PostSimple.tsx`, `PostBanner.tsx`): take `content`, `authorDetails`, `prev`, `next`, children = MDX body. Render title, date, tags, author cards, "View on GitHub", comments.
- **`layouts/AuthorLayout.tsx`**: props-only; renders one author's fields + body.
- **`layouts/ListLayoutWithTags.tsx`** / `ListLayout.tsx`: `"use client"` (uses `usePathname`); take `posts`, `initialDisplayPosts`, `pagination`, `title`; `ListLayoutWithTags` imports `tag-data.json` itself.
- **`components/Card.tsx`**: props-only (`title`, `description`, `imgSrc`, `href`); used by projects.
- **`components/Header.tsx`**, **`Footer.tsx`**, **`MobileNav.tsx`**: read `siteMetadata` / `headerNavLinks` directly (not props). Reshape in Phase 4 only if re-rendered.
- **Client components** (`"use client"`): `app/theme-providers.tsx`, `components/MobileNav.tsx`, `Comments.tsx`, `ScrollTopAndComment.tsx`, `ThemeSwitch.tsx`, `layouts/ListLayout.tsx`, `ListLayoutWithTags.tsx`; plus pliny client components (`NewsletterForm`, `BlogNewsletterForm`, `TOCInline`, `Pre`, search). Server components read data only through `contentlayer/generated` and `data/*` imports; none use `fs` or `fetch`.
- **Section components on pages**: home = intro + latest-post list + "All Posts" link + newsletter form (all inline in `Main.tsx`); projects = intro + `Card` grid.
- **`next/image`**: `components/Image.tsx` wraps it (prefixes `BASE_PATH`); used by `Card`, `AuthorLayout`, post layouts (author avatars, banner) and MDX images via `remarkImgToJsx`. Sources: local `/static/images/...`; remote `picsum.photos` allowed.
- **Visual-editing candidates**: home intro, projects intro and cards, blog post title/summary/body in the three post layouts, author fields + bio in `AuthorLayout`. **Sidebar/data editing**: navigation, site settings, social links, footer credit.

### Census table

Pages not already content in a collection:

| Page file | Distinct content sections | Layout repeated on other pages? | Editor will add similar pages? | Recommended pattern | Needs editable region? |
| --- | --- | --- | --- | --- | --- |
| `app/page.tsx` (+ `app/Main.tsx`) | page header (title "Latest", description), latest posts list (5, from `blog`), "All Posts" link, newsletter form | Yes — the page header matches `/projects`, `/blog`, `/tags` | Maybe (landing pages) | Page builder — `data/pages/index.md`, `content_blocks` | Yes |
| `app/projects/page.tsx` | page header (title, description), project card grid | Header yes; card grid no | Maybe | Page builder — `data/pages/projects.md`, `content_blocks`; projects become the grid block's items | Yes |
| `app/about/page.tsx` | "About" heading, author card, bio body | No | No | Keep `authors` collection entry `default` (fixed-schema); heading stays a label (Q5) | Yes (author fields + body) |
| `app/blog/page.tsx`, `app/blog/page/[page]/page.tsx` | "All Posts" label, post list, tag sidebar, pagination | Yes (tag pages) | No | Listing — leave as code (no intro content; Q5) | No |
| `app/tags/page.tsx`, `app/tags/[tag]/…` | "Tags" label, tag cloud / filtered list | Yes | No | Taxonomy — leave as code | No |
| `app/not-found.tsx` | 404 heading, message, link | No | No | Hardcoded template | No |
| `app/sitemap.ts`, `app/robots.ts`, RSS | — | — | No | Leave as code | No |
| `components/Header.tsx` (nav) | nav links, header title | All pages | — | Data file (navigation `items[]`) | No (sidebar) |
| `components/Footer.tsx` | social links, author, title, credit link | All pages | — | Data file (site/footer settings) | No (sidebar) |

Blog posts and authors are already collections and are not census rows; their layouts get editable regions in Phase 4 (title, summary, body; author fields and bio).

### Primitive-vs-computed (route files)

- `app/page.tsx`: computed — `sortPosts`/`allCoreContent` over `blog`; `Main.tsx` reads `siteMetadata.description` (data import), `posts.slice(0, 5).map`, conditional "All Posts" link, conditional newsletter. Target: the route reads `data/pages/index.md` and passes blocks; the post list becomes a block component taking props.
- `app/projects/page.tsx`: literal h1/p in the route; `projectsData.map` (data import). Target: blocks from `data/pages/projects.md`.
- `app/about/page.tsx`: `allAuthors.find(slug === 'default')` lookup; `AuthorLayout` gets primitives. Acceptable — collection entry lookup.
- `app/blog/[...slug]/page.tsx`: lookups for post, authors, prev/next, layout choice — computed, but all passed as props into the layout components, which take primitives.
- Listing/tag routes: computed from collections; left as code.

### Frontmatter co-location

- Home intro reads `siteMetadata.description` (site data) rather than page front matter → the intro block holds its own `title`/`description`; `siteMetadata.description` stays the SEO default.
- `Card` props = one project item → co-located once projects live under one block key.
- `AuthorLayout` props = one author entry → OK.
- Post layouts: `content` = one blog entry → OK; `authorDetails` come from the `authors` collection (lookup), not post front matter — leave as computed, not regions.
- `Header`/`Footer` read `siteMetadata`/`headerNavLinks` directly → become data-file reads; not re-rendered regions.

### Shared-UI treatment

- Header / Navigation → `navigation` data file with `items[]` (`href`, `title`) from `headerNavLinks.ts`.
- Footer social links + credit → data file (site settings + footer credit). No link columns.
- CTA on several pages → newsletter form (home + one post); treatment depends on Q1.
- Share block → none.
- Author card → existing `authors` collection (has bodies and the `/about` page), with blog `authors` as a multiselect of author slugs. Not a data file: written reason, the entries own MDX bios and a route.
- Cookie / announcement bar → none.

## 5. Build pipeline

- `build`: `cross-env INIT_CWD=$PWD next build && cross-env NODE_OPTIONS='--experimental-json-modules' node ./scripts/postbuild.mjs`.
  - `next build` runs contentlayer (→ `.contentlayer/`, `app/tag-data.json`, `public/search.json`).
  - `postbuild.mjs` → `rss.mjs`: writes `feed.xml` and per-tag feeds to `out/` when `EXPORT` is set, else `public/`.
- Unchanged build: exit 0; routes as in § 3; only `/api/newsletter` is `ƒ`. `git status` clean afterwards (`tag-data.json` regenerated identical).
- Env vars: `EXPORT`, `UNOPTIMIZED`, `BASE_PATH`, `ANALYZE` (next config); `NEXT_UMAMI_ID`; `NEXT_PUBLIC_GISCUS_*`, `NEXT_PUBLIC_UTTERANCES_REPO`, `NEXT_PUBLIC_DISQUS_SHORTNAME` (comments); newsletter provider keys (`BUTTONDOWN_API_KEY` etc., used only by the API route). `.env.example` lists them; no `.env*` with values in the repo.
- Next config values from env: `output` (`EXPORT`), `basePath`, `images.unoptimized`. `rss.mjs` branches on `EXPORT` too, so the CloudCannon build must set `EXPORT` (or Phase 2 makes the export unconditional and updates `rss.mjs` to match).
- Hosting config: `.github/workflows/pages.yml` (GitHub Pages; Node 20; `yarn build` with `EXPORT=1`, `UNOPTIMIZED=1`, `BASE_PATH` from Pages; uploads `out/`). No `vercel.json`, `netlify.toml`, `_headers`, `_redirects`. `siteUrl` is `https://tailwind-nextjs-starter-blog.vercel.app` and the README has a Deploy-with-Vercel button. Headers only in `next.config.js` `headers()`; no redirects or rewrites.

## 6. Flags and special patterns

- Positional CSS selectors: none in `app/`, `components/`, `layouts/`, `css/`.
- Global DOM scripts: `ScrollTopAndComment.tsx` uses `document.getElementById('comment')` on click and a `scroll` listener — interaction only, outside editable content.
- Numbers as text: tag counts (computed). None in editable content.
- Styled HTML in strings: none (`dangerouslySetInnerHTML` only for JSON-LD).
- Load-time behaviour: none hides editable content. `opacity-0` in `MobileNav`/`ThemeSwitch` are Headless UI open/close transitions; `.content-header-link { opacity: 0 }` is a hover-reveal heading anchor; comments load on a button click; the scroll-to-top buttons appear after scrolling. No `IntersectionObserver`, `setInterval`, carousels or reveal classes.
- Forms: newsletter forms (home, one post) — see Q1. No sign-in/account forms.

## 7. Sizing

- Total pages (content-file or static-route backed; listings, tags, pagination excluded): 11 blog posts + `/` + `/about` + `/projects` = **14** (threshold > 30: ok)
- Hardcoded → YAML conversions (census rows to page builder / fixed-schema): home, projects = **2** (threshold > 15: ok)
- Distinct collections: `blog`, `authors`, `pages` (new) = **3**; data files (navigation, site settings) are `data_config`, not collections (threshold > 5: ok)
- Tripped: **0/3** — no `plan.md`; phases run unsectioned.

## Decisions and why

- **Keep contentlayer2.** It already validates and generates content; Phase 3 fits into it (per `nextjs/content.md` § Existing content libraries) rather than replacing it.
- **`pages` collection lives inside contentlayer's root at `data/pages/`**, with a new `Page` document type declaring `_schema` and `content_blocks`. Why: new collections go inside the library's content root, and undeclared keys are dropped. Home is `data/pages/index.md` (index file so the URL collapses to `/`), read by `app/page.tsx`; projects is `data/pages/projects.md`, rendered by a new `app/[slug]/page.tsx` that replaces `app/projects/`.
- **Array-based page builder (`content_blocks`) for home and projects.** Both have 2+ sections; the project owns the templates; there are 3+ reusable blocks: page header (title + description), latest-posts list, project card grid, newsletter (subject to Q1), plus a markdown/rich-text block.
- **Projects become inline items of the project-grid block** on `data/pages/projects.md`, and `data/projectsData.ts` is removed. Why: only one page uses them and they have no URLs of their own, so neither a collection nor a shared data file is needed.
- **Collections `blog` and `authors` keep their current paths and shapes.** Blog URL = `/blog/<path under data/blog>/` (trailing slash; nested folders allowed). `authors` stays a collection (author card exception, reason above); blog `authors` → multiselect of author slugs; `layout` → select of `PostLayout`/`PostSimple`/`PostBanner`.
- **Site settings split.** Editor-facing values in `siteMetadata.js` (title, headerTitle, author, description, email, social URLs) and `headerNavLinks.ts` move to data files; provider config (analytics, comments, search, newsletter provider) and `process.env`/`BASE_PATH` logic stay in code. New data files go outside contentlayer's `data/` root (or `data/` excludes them in contentlayer config); Phase 2 picks the folder per `cloudcannon-configuration/nextjs/configuration.md` § Data files.
- **Listings, tag pages, pagination, 404, sitemap, robots, RSS stay code.**
- **Export settings:** Phase 2 sets `output: "export"` and `images.unoptimized` (gated on an env var if production stays elsewhere, which the existing `EXPORT`/`UNOPTIMIZED` switches already do); `basePath` stays unset on CloudCannon; `trailingSlash: true` stays.
- **Snippets (Phase 2):** `TOCInline` and `BlogNewsletterForm` as MDX component snippets; `<video>`, the gallery grid and the credit `<div>`s as raw snippets.
- **Markdown-extension forms:** `deriving-ols-estimator.mdx` (all math forms) gets `_enabled_editors: [source, data]`; footnotes, citations and alerts get raw snippets so the Content Editor keeps them. See Q4.
- **Node:** pin Node 20 (what the repo's CI uses) in CloudCannon build settings unless Phase 2's Next requirement says otherwise. Package manager: Yarn 3.6.1 via the committed `yarnPath`.

## Open questions

- **Q1 (blocking Phase 2) — newsletter endpoint and production hosting.** `/api/newsletter` (POST) can't exist in a static export, so both pliny subscribe forms 404. Options:
  1. CloudCannon hosts production; replace both forms with a plain HTML form posting to a CloudCannon Inbox (`method="post"`, hidden `inbox_key`); delete the route. Sign-ups arrive in the Inbox, not straight into Buttondown.
  2. CloudCannon hosts production; remove the newsletter (route, home form, `BlogNewsletterForm` mapping and its one use).
  3. Production stays on Vercel (or another server host) with CloudCannon for editing only; Phase 2 gates the export on an env var set only in CloudCannon, so production keeps `/api/newsletter` and the forms. Forms 404 only in CloudCannon previews.
  4. Keep the pliny forms and set `apiUrl` to an endpoint hosted elsewhere (a serverless function returning the JSON pliny expects).
  Recommendation: 3 if the Vercel deployment is the real production site (`siteUrl` and README point there); otherwise 1. No default taken — Phase 2 waits.
  **Answered: option 3.** Vercel stays production; CloudCannon is for editing only. The export is gated on `CLOUDCANNON_EXPORT`, set only in the CloudCannon build. Production keeps `/api/newsletter` and both forms; they 404 only in CloudCannon previews. See `configuration.md`.
- **Q2 — security headers.** If CloudCannon hosts, carry the `next.config.js` headers into `.cloudcannon/routing.json`? Default: yes, except anything Phase 2 finds would block the Visual Editor (likely `X-Frame-Options: DENY` and parts of the CSP).
  **Answered:** CloudCannon doesn't host, so the headers stay in `next.config.js` and there is no `routing.json`.
- **Q3 — draft post.** `my-fancy-title.mdx` builds as a 404 page in production. Default: keep it as is; editors see the not-found view when previewing a draft.
- **Q4 — markdown extensions.** Default: math post Source Editor only; raw snippets for footnotes (4 posts), citations (1), alerts (1).
- **Q5 — one-word page headings** ("About", "All Posts", "Tags") and layout labels ("Previous", "Next", "View on GitHub", "Read more"). Default: leave in code as UI labels.
- **Q6 — logo.** `data/logo.svg` is an SVGR import, so editors can't swap it. Default: leave in code; moving it to `public/` and an `<img>` would make it a data-file field.
- **Q7 — footer theme credit** ("Tailwind Nextjs Theme" link). Default: make it a footer data-file field so editors can change or remove it.
