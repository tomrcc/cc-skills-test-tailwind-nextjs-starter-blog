# Phase 3 — Content

Site: `tailwind-nextjs-starter-blog` (Next.js 15.5.12 App Router, contentlayer2 0.5.8, Yarn 3.6.1). Inputs: `audit.md`, `configuration.md`. No `plan.md`.

## Checklist

Tracked here (no todo tool). `migrate-to-cloudcannon/content.md`, `nextjs/content.md`, `page-building.md`, `nextjs/page-building.md`.

### Parity baseline
- [x] Baseline export build saved before the first edit; every changed page compared on visible text, link `href`s, image file names, `alt`s, `<title>`, meta and OG description (§ Parity)

### Front matter consistency
- [x] Required fields present: blog, authors unchanged (Phase 2 checked them); pages files hold every schema key (`_schema`, `title`, `description`, `content_blocks`)
- [x] Defaults written into files: page `title`/`description` hold what the pages rendered before; `latest_posts.count: 5`, `newsletter.title`, `author_profile.heading`/`author` hold the component defaults
- [x] Every key in the schema: `page-builder.md` covers the three pages
- [x] `draft`: unchanged on blog; pages have no draft
- [x] Dates: unchanged (Phase 2 decision)
- [x] Image paths: `/static/images/...` from the site root for project `imgSrc` and gallery `src`, matching `paths.static: public`

### Field naming
- [x] Block fields match component props (`imgSrc`, `count`, `heading`, `author`); no reserved keys; no `image`/`thumbnail` mix

### Mixed-type fields / string references
- [x] None new. `author_profile.author` is a slug, picked from `collections.authors` (Phase 2 select)

### Markdown body
- [x] Gallery grid in `pictures-of-canada.mdx` converted to `<Gallery images={…} />` on one line; the copy inside the code fence is left as documentation
- [x] Four credit `<div>`s normalised to `<div>` / one line of markdown / `</div>`
- [x] `<video>` in `release-of-…-v2.0.mdx` normalised to the snippet's one-line `<source src="…" type="video/webm" />`
- [x] No other body changes; plugin output untouched

### Styled HTML in front matter
- [x] None

### Page-builder content
- [x] Every block in `index.md`, `projects.md`, `about.md` has every field of its structure value, cross-checked field by field (§ Field completeness)
- [x] Components guard nulls: `title &&`, `description &&`, `heading &&`, `count ?? 5`, `items ?? []`, `image?.src &&` per gallery item, `title || undefined` for the newsletter
- [x] Built after the first page, then the rest

### One field per visual slot
- [x] Home intro reads the block's `description`, not `siteMetadata.description`; page `description` is the meta description only

### API-driven content
- [x] None

### Settings in code → data files
- [x] `data/settings/site.json`, `navigation.json`, `tags.json` created; `siteMetadata.js` spreads `site.json`, `headerNavLinks.ts` re-exports `navigation.items`, so every consumer is unchanged
- [x] Footer credit text and link read from `site.json`; hidden when the text is empty
- [x] `data_config`/`file_config` entries exist (Phase 2)

### Data collections
- [x] `settings` has `disable_url: true`; JSON valid; nesting ≤ 2 levels; `tags.json` is a top-level array with `id` per item

### Next.js specifics
- [x] contentlayer kept; `pages` inside its root (`data/pages/`); `Page` type declares `_schema`, `title`, `description`, `content_blocks` (json); `settings` added to `contentDirExclude` with the defaults (no unknown-document warnings; 16 documents)
- [x] Loader throws on a missing page (`lib/pages.ts` `getPage`) and on an unknown author slug
- [x] `app/[slug]/page.tsx` replaces `app/projects/` and `app/about/`; skips `index`; renders `content_blocks` for `page_builder`, else the MDX body
- [x] `app/page.tsx` reads `data/pages/index.md`; `title.absolute` keeps the home title untemplated
- [x] `generateMetadata` from page front matter on `[slug]`
- [x] Hard-coded route list in `app/sitemap.ts` built from `allPages`
- [x] `blockMap` in `app/cloudcannon/componentMap.ts`, `componentMap` spreads it; `components/Blocks.tsx` renders only from `blockMap` and throws on an unknown `_type`
- [x] Block components render from props only (client-safe for Phase 4 registration)

### Addendum
- [x] Field completeness (CRITICAL) — § Field completeness
- [x] Fields the original page didn't pass hold the resolved default
- [x] No block-level HTML in front matter strings
- [x] Every array in a structure-value file links its `_structures` entry (`project_grid.items` → `_structures.project_items`; Phase 2)
- [x] Every visible value in data-file consumers an editor would change lives in the data file (footer credit moved; icons stay keyed by social kind)
- [x] Collection URLs match `out/`; every `_inputs` key names a field in the files
- [x] This note records every structural change

## Field completeness

Structure value → content file:

- `page_header` {`_type`, `title`, `description`}: `index.md` (Latest / site description), `projects.md` (Projects / "Showcase your projects with a hero image (16 x 9)")
- `latest_posts` {`_type`, `count`}: `index.md` `count: 5` (was `MAX_DISPLAY`)
- `newsletter` {`_type`, `title`}: `index.md` `title: Subscribe to the newsletter` (pliny's default, what rendered)
- `project_grid` {`_type`, `items`}; `project_items` {`title`, `description`, `imgSrc`, `href`}: both projects have all four
- `author_profile` {`_type`, `heading`, `author`}: `about.md` `About` / `default`
- Page schema {`_schema`, `title`, `description`, `content_blocks`}: all three files

## Structural changes

- New: `data/pages/{index,projects,about}.md`, `data/settings/{site,navigation,tags}.json`, `components/blocks/{PageHeader,LatestPosts,ProjectGrid,Newsletter,AuthorProfile}.tsx`, `components/Blocks.tsx`, `components/Gallery.tsx`, `app/cloudcannon/componentMap.ts`, `app/[slug]/page.tsx`, `lib/pages.ts`
- Changed: `contentlayer.config.ts` (`Page` type, `contentDirExclude`), `app/page.tsx`, `app/sitemap.ts`, `components/Footer.tsx`, `components/MDXComponents.tsx` (adds `Gallery`), `data/siteMetadata.js`, `data/headerNavLinks.ts`, `data/blog/pictures-of-canada.mdx`, `data/blog/release-of-tailwind-nextjs-starter-blog-v2.0.mdx`
- Deleted: `app/projects/`, `app/about/`, `app/Main.tsx`, `data/projectsData.ts`, `layouts/AuthorLayout.tsx` (only `/about` used it; `AuthorProfile` holds its markup)

## Parity

Baseline: `CLOUDCANNON_EXPORT=true yarn build` on the Phase 2 tree. After: same build. All 56 HTML pages compared on visible text (whitespace-collapsed), `href`s, image names, `alt`s, `<title>`, meta description, `og:title`, `og:description`: **0 differences**, same page set. `feed.xml` identical. `app/tag-data.json` regenerates unchanged.

Markup differences that don't change what is visible:

- The page header owns `border-b border-gray-200 dark:border-gray-700` instead of a `divide-y` wrapper around header + next section (same 1px rule, same colour).
- Gallery images render as plain `<img loading="lazy" decoding="async">` without `width`/`height`/`data-nimg`; each shows at its natural size capped at the column, as before. The wrapper `<div>` remarkImgToJsx added around each image is gone.
- `sitemap.xml` gains `/about` (it lists every `pages` entry now), in `''`, `blog`, `tags`, then pages order.

Default build: `/` still shows the newsletter form; `/api/newsletter` is still `ƒ`; titles `Next.js Starter Blog`, `About | …`, `Projects | …` as before.

The Text page (`default` schema) branch of `app/[slug]` was checked with a temporary `data/pages/parity-text-page.md` (title, MDX body, link): built to `/parity-text-page/` with a `PageTitle` and prose body. The file was then deleted and the export rebuilt.

## Decisions and why

- **Block data comes through props.** `lib/pages.ts` `resolveBlocks` adds `posts` (all published posts, newest first) to `latest_posts` and `authorDetails` + `bioCode` to `author_profile`; the block components import no collection. Why: registered components must render from props only. Phase 4 decides how the editor gets those computed props (they are not structure fields and are never written to files).
- **`latest_posts` gets the whole post list**, so "All Posts" still shows when there are more than `count`.
- **Page `title`/`description` hold the rendered values**, including the site description on all three pages, rather than empty fields falling back to `site.json`. Why: editors see what the file holds. Changing the site description no longer changes these pages' meta descriptions.
- **Home title uses `title.absolute`**, as the root layout's untemplated default did.
- **Page slug comes from the file name** (`_raw.sourceFileName`), because contentlayer's `flattenedPath` turns `pages/index.md` into `pages`.
- **Text page bodies render with the shared MDX component map**, so snippets work there as in posts.
- **Gallery uses a plain `<img>`.** `next/image` needs dimensions the snippet doesn't store; `fill` or `width={0}` changes how images size. Cost: the Vercel build no longer optimises those four images (see Open questions).
- **`siteMetadata.js` keeps its shape** by spreading `site.json` (`require`, so contentlayer, Next and `rss.mjs` all read it). `data/` isn't in `next build`'s lint dirs, so the `no-require-imports` rule doesn't run on it.
- **`twitter: ""`** in `site.json` (was commented out); `SocialIcon` skips empty links, so nothing renders.
- **Credit `<div>`s on one line.** The markdown inside renders the same paragraph; one format per pattern keeps the raw snippet matching.

## Cross-phase fixes

None outside Phase 3 scope. `.nvmrc` and `FEEDBACK.md` are untracked files this phase didn't create; left untouched.

## Open questions

1. **Gallery image optimisation on Vercel.** Default: plain `<img>`, visually identical, unoptimised. Alternative: add `width`/`height` to `gallery_images` (editors fill them) or a remark step that reads sizes from `public/` at build time, then use `next/image`.
2. **Sitemap now lists `/about`.** Default: keep; every `pages` entry is a public page.
3. **Page meta descriptions are copies of the site description.** Default: keep the copies. An empty `description` already falls back to the site description, so clearing it in the three files makes them follow Settings > Site.
4. **Computed block props in the Visual Editor** (`posts`, `authorDetails`, `bioCode`). Default: Phase 4 chooses the treatment; Phase 3 only keeps the components props-only.
