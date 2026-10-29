# Phase 4 — Visual editing

Site: `tailwind-nextjs-starter-blog` (Next.js 15.5.12 App Router, React 19.2.4, contentlayer2, Yarn 3.6.1). Inputs: `audit.md`, `configuration.md`, `content.md`. Package: `@cloudcannon/editable-regions` 0.0.22.

## Section census

Written before any region; updated after implementation. Every row is implemented.

| Page | Section | Treatment | Binding plan | Data completeness | Justification |
| --- | --- | --- | --- | --- | --- |
| All pages | Header site title | data-file (text) | `data-prop="@data[site].headerTitle"` on the title `<div>` | In `site.json` | — |
| All pages | Header logo | sidebar-only (code) | — | `data/logo.svg`, SVGR import (audit Q6 default) | Inline SVG compiled into JS: no `<img>` for an image region |
| All pages | Header nav links | data-file + array | `@data[navigation].items` on the desktop nav container; each link an `array-item`; `<editable-text data-prop="title">`; `<template>` blueprint via `RawTemplate` | `href`, `title` in `navigation.json` | — |
| All pages | Mobile nav, search, theme switch | none | — | Mobile nav reads the same `navigation.json` | Mobile nav is a portaled dialog, and regions stay out of portaled UI; its items are edited in the desktop nav. Search and theme switch show no content |
| All pages | Footer | data-file + component | `<footer data-editable="component" data-component="footer" data-prop="@data[site]">` around `FooterContent`; inside: `author`, `title`, `themeCredit.text` | Social URLs, author, title, credit in `site.json`; year computed | — |
| `/`, `/projects/`, `/about/` | Blocks | array (page builder) | `data-editable="array" data-prop="content_blocks" data-component-key="_type"`; each block an `array-item` with `data-component={_type}` | — | — |
| `/`, `/projects/` | `page_header` block | text | `title` (`<h1>`), `description` (`<p>`) | Both in the block | — |
| `/` | `latest_posts` block | component + `@file` text | Re-renders from `count` plus `data-literal-posts`; per post `<editable-text data-prop="@file[/data/<filePath>].title">` and `@file[…].summary` on the summary `<div>` | `count` in block; posts computed from `blog` | — |
| `/` | `newsletter` block | component | Re-renders on `title` | `title` in block | `pliny/ui/NewsletterForm` renders the title itself and takes no attributes (third-party). The block is registered, so sidebar edits re-render it live |
| `/projects/` | `project_grid` block | array + text + image | `items` on the grid container; each `Card` root an `array-item`; `title` (`editable-text`), `description` (`<p>`), `imgSrc` (`data-prop-src` on the `<img>`) | `href` in item (URL, sidebar) | — |
| `/about/` | `author_profile` block | component + text + `@file` | `heading`; the `author` select re-renders the block, which looks the author up itself; `@file[/data/authors/<slug>.mdx]` `name`, `occupation`, `company`, `avatar`, `@content` (block) | Author fields live in the author file | — |
| `/about/` | Author social icons | sidebar-only | — | URLs in the author file | URL-only icons with no visible text; edited in Authors |
| Text pages (`default` schema) | Title, body | text | `title` on `PageTitle`; `@content` (block) on the prose `<div>` | — | — |
| Blog post (3 layouts) | Title | text | `title` on `PageTitle` | — | — |
| Blog post (3 layouts) | Body | text | `data-type="block" data-prop="@content"` on the existing prose `<div>`, MDX rendered inside | — | — |
| Blog post (Standard, Simple) | Date | sidebar-only | — | `date` | Dates must not be text regions; the input comment says the page updates after the next build |
| Blog post (Standard) | Authors | component + `@file` | `<ul data-editable="component" data-component="post_authors" data-prop-authors="authors">`; `PostAuthors` looks the slugs up; `@file` `name`, `avatar` | Author fields in author files | — |
| Blog post (Standard) | Tags | component | `<div data-editable="component" data-component="post_tags" data-prop-tags="tags">` | `tags` | — |
| Blog post (Banner) | Banner image | image | `data-prop-src="images.0"` on the `<img>` when `images` is a non-empty list | `images` | The placeholder (picsum) shown when `images` is empty has no field to bind |
| Blog post (3 layouts) | Previous / next titles | `@file` text | `<editable-text data-prop="@file[/data/<filePath>].title">` | Other posts' titles | — |
| Blog post (3 layouts) | Labels ("Tags", "Previous Article", "View on GitHub", "Discuss on Twitter", "Back to the blog") | code | — | — | Audit Q5 default: UI labels stay in code |
| Blog post | Summary | none on the page | — | `summary` | Not rendered on post pages (meta, listings and feeds only); editable inline on `/` via `@file` |
| Blog post | Layout | sidebar-only | — | `layout` | Picks the route's layout component; route code doesn't re-run in the editor, so it shows after the next build |
| `/blog/`, tags, pagination, 404 | Listings | none | — | — | Audit census: listings stay code |

### Audit census rows ("Needs editable region? Yes")

- `app/page.tsx` (home): wired — blocks array, `page_header`, `latest_posts`, `newsletter` as above.
- `app/projects/page.tsx` (now `data/pages/projects.md`): wired — `page_header`, `project_grid`.
- `app/about/page.tsx` (now `data/pages/about.md`): wired — `author_profile` heading, author lookup, author fields and bio via `@file`.
- Blog posts and authors (named in the audit as Phase 4 work): wired — title, body, authors, tags, banner image, prev/next in the three layouts; author fields on `/about/` and post author cards.
- Header and Footer rows were "No (sidebar)" in the audit; both are wired with `@data` regions anyway, per the shared-UI table.

## Setup

- `@cloudcannon/editable-regions` added to `dependencies` (Yarn 3.6.1; `package.json`, `yarn.lock`).
- `tsconfig.json` already has `moduleResolution: bundler`.
- `app/layout.tsx`: `<EditableRegions tag="section" className=…>` takes `SectionContainer`'s place and markup, wrapping `SearchProvider` → `Header`, `<main>`, and `Footer`. `<CloudCannonEditor />` renders after `ThemeProviders`.
- `components/CloudCannonEditor.tsx` (`"use client"`): imports `../app/cloudcannon/registerComponents` only when `window.inEditorMode` is set.
- `app/cloudcannon/registerComponents.ts` registers every `componentMap` entry with `registerReactComponent`.
- `app/cloudcannon/componentMap.ts`: `blockMap` (5 blocks) spread into `componentMap`, plus `footer` (`FooterContent`), `post_authors` (`PostAuthors`), `post_tags` (`PostTags`).
- `components/RawTemplate.tsx` for `<template>` blueprints.
- `css/tailwind.css`: editor-only `min-width`/`min-height` on an empty array region (under `.cms-editor-active`).

## Checklists

Tracked here (no todo tool on this host).

### Infrastructure
- [x] `@cloudcannon/editable-regions` in `dependencies`
- [x] `output: "export"` under `CLOUDCANNON_EXPORT=true` (Phase 2)
- [x] `moduleResolution: bundler`
- [x] Exactly one `<EditableRegions>` in `app/layout.tsx`, wrapping header, `children` and footer
- [x] `<CloudCannonEditor />` rendered in `app/layout.tsx`
- [x] Relative `import()` of `registerComponents` inside the `inEditorMode` check
- [x] `CloudCannonEditor.tsx` starts with `"use client"`
- [x] No `pages/` directory
- [x] No `@cloudcannon/react-connector` / `CloudCannonConnect`
- [x] No client component imports `registerReactComponent` or the component map at the top level (only `registerComponents.ts`, reached through the dynamic import)
- [x] `next build` passes (both builds)

### Universal
- [x] Editor enablement: `pages` and `blog` have `visual`; `authors` and `settings` are reached only through `@file`/`@data` regions on other pages
- [x] Census coverage (above)
- [x] Array containers: `content_blocks`, `items`, `@data[navigation].items` each have `array` + `array-item`
- [x] Per-loop census: `ProjectGrid` loop is an array region with `array-item` Cards and text/image regions. `LatestPosts`, `PostAuthors` and `PostTags` loop over computed or multiselect values, not editable arrays of the file (see Decisions)
- [x] Nested editables in every array item
- [x] Relative paths inside items (`title`, `description`, `imgSrc`)
- [x] Array container purity: nav container holds links plus one `<template>`; grid and blocks hold items only
- [x] Image editables: `imgSrc`, author avatars (`@file`), banner `images.0`. MDX body images are inside `@content`
- [x] Child component labels: audit Q5 default (labels stay code)
- [x] Shared partials backed by data: header (`@data[site]`, `@data[navigation]`), footer (`@data[site]` component)
- [x] Data file completeness: footer credit in `site.json`; social icons keyed by kind
- [x] Cross-collection select wiring: `author_profile.author` → `AuthorProfile`; blog `authors` → `post_authors`; blog `tags` → `post_tags`. Each looks up or renders from its own prop and is wrapped at the call site
- [x] `_inputs` audit: every `data-prop` field has an input of a matching type (`headerTitle`, `items[].title`, `author`, `title`, `themeCredit.text`, `content_blocks`, `page_header.title/description`, `items`, `project_items.*`, `heading`, `author`, blog `title`/`summary`/`authors`/`tags`/`images[*]`, author `name`/`occupation`/`company`/`avatar`, page `title`). Text regions sit on `text`/`textarea` inputs as span regions; `@content` regions are block
- [x] Schema-file seed audit: `post.mdx`, `page.md`, `page-builder.md`, `author.mdx` hold every wired field
- [x] Markdown body: `@content` on posts, text pages, author bio (`@file`)
- [x] Source editables: none needed (no hardcoded page text outside Q5 labels; none allowed in route files)
- [x] Conditional guards on every optional region (`title &&`, `description &&`, `summary &&`, `imgSrc &&`, `avatar &&`, `occupation &&`, `company &&`, `themeCredit?.text &&`, `author &&`, nav `link.title &&`)
- [x] Inline vs block: block only on `@content`
- [x] Component prop contract: blocks get `{...block}` plus literals; `FooterContent` gets `site.json`'s keys; `PostAuthors`/`PostTags` get `{ authors }` / `{ tags }` via `data-prop-*`
- [x] Cross-collection editable guard: n/a (no component renders both frontmatter items and cross-collection items)
- [x] `<template>` blueprints: nav list (can be emptied). Project items are a sub-array of a re-rendered block whose container stays when empty
- [x] Data file input config (Phase 2)

### Page builder
- [x] Wrapper `data-component-key="_type"` with `data-editable="array" data-prop="content_blocks"`
- [x] `array-item` + `data-component` on each block's wrapper `<div>`; component roots stay plain
- [x] Widget nested editables (page header, posts, grid, author profile)
- [x] Sub-array `items` in `project_grid`
- [x] UI component variants: one `Card`, one `PageTitle`; three post layouts all wired
- [x] Component keys match `_type`; every `_type` in content (`page_header`, `latest_posts`, `newsletter`, `project_grid`, `author_profile`) is in `blockMap`
- [x] Build output has `data-component-key`, `data-component=`, `data-editable="array-item"`

### Next.js
- [x] `_enabled_editors` and `file_config` per the configuration guide (Phase 2)
- [x] Every region sits inside `<EditableRegions>`; the mobile nav dialog (portaled) has none
- [x] Every `componentMap` key is used by a `data-component` in `out/`
- [x] Client-safe registered components: none is async, reads files, uses `useRouter`, `server-only` or `next/headers`. Author data comes from `lib/authors.ts`, which imports `.contentlayer/generated/Authors/_index.json` alone; the editor chunk is 37 KB and holds no blog bodies
- [x] Rich text hosts: every `block` region renders the MDX component inside the host
- [x] Blueprints through `RawTemplate`
- [x] Spread props (above)

### Pre-handoff sweep
- [x] Census walk-through: every row implemented or justified
- [x] Shared-UI table: header/navigation → `navigation.json` + `site.json` `@data` regions (not a registered component: `Header` holds kbar, next-themes and Headless UI context consumers, so per the Next.js decision order its fields get primitive `@data` regions); footer credits → `site.json` component; footer link columns → none (no columns); CTA → `newsletter` block on `/` and the `blog_newsletter_form` snippet in one post; share block → none; author card → `authors` collection (audit's written reason), `@file` regions; cookie/announcement bar → none
- [x] Build grep: `footer`, `author` (`author_profile`, `post_authors`, `@file[/data/authors/…]`), `newsletter` all present; no share block exists

## Verification

- `CLOUDCANNON_EXPORT=true node .yarn/releases/yarn-3.6.1.cjs build` → exit 0 (60 static pages, lint and type check pass).
- `node .yarn/releases/yarn-3.6.1.cjs build` (default, Vercel) → exit 0; `/api/newsletter` still `ƒ`.
- `out/` region counts (`grep -oE`):
  - `/`: `_dynamic` root; `content_blocks` array with `page_header`, `latest_posts` (with `data-literal-posts`, ~5 KB), `newsletter`; 5 `@file` titles and 5 `@file` summaries; nav array (5 items, Home hidden) + blueprint; header title; footer component with `author`, `title`, `themeCredit.text`.
  - `/projects/`: `page_header`, `project_grid` with `items` array, 2 Card items each with title, description, `imgSrc` image.
  - `/about/`: `author_profile` with `heading`, `@file[/data/authors/default.mdx]` `name`, `occupation`, `company`, `avatar`, `@content`.
  - `/blog/introducing-tailwind-nextjs-starter-blog/` (Standard): `title`, `@content`, `post_authors` (two authors' `@file` name + avatar), `post_tags`, prev/next `@file` titles.
  - `/blog/new-features-in-v1/` (Simple): `title`, `@content`, prev/next `@file` titles.
  - `/blog/pictures-of-canada/` (Banner): `title`, `@content`, `images.0` image, prev/next `@file` titles.
- Production page load: HTML references only the shared chunks. `@cloudcannon/editable-regions/react` (the `EditableRegions` root, a few hundred bytes of listeners for `cloudcannon:load` / `editable-regions:load`) is in the shared chunk, as the docs require. The registration chunk (component map, `registerReactComponent` calls, author JSON) is referenced by no HTML file, only by the webpack runtime's chunk map, and loads only after `window.inEditorMode`.

## Hydration

Every exported page hydrates without a React error (checked with headless Chromium on `out/`, served statically, on `/`, `/about/`, `/projects/`, `/tags/`, `/blog/` and one post per layout).

- `components/MobileNav.tsx` renders its Headless UI `Transition`/`Dialog` only after mount. Headless UI 2.2.9 renders a hidden `<span>` for the closed `unmount={false}` dialog on the server and nothing in that spot on the first client render. React then throws #418 (`args[]=HTML`) on every page. The original template's static export (commit `6287e59`, `EXPORT=1 UNOPTIMIZED=1`) shows the same error, so it doesn't come from the editor or the regions.
- After a hydration error, React drops the server DOM and renders the whole document again on the client (`clearContainerSparingly` in `react-dom-client`: everything in `<html>`, `<head>` and `<body>` except scripts, `<style>` and stylesheet links is removed). In the Visual Editor this showed as rows of unstyled region controls and a missing "Read more" link on `/` and `/about/`. That matches the row in `cloudcannon-visual-editing/troubleshooting.md` for "Rows of unstyled white editor buttons appear in the page flow".
- Region code doesn't write to the DOM before hydration. Every region sits inside the `EditableRegions` root, and a region whose parent hasn't mounted returns early in `pushValue` (`nodes/editable.ts`, `parentMounted`). That includes `@data`/`@file` regions.

## Decisions and why

- **Computed block props (content.md Q4).**
  - `latest_posts.posts`: passed as `data-literal-posts` on the block's `array-item`, trimmed to `slug`, `date`, `title`, `summary`, `tags`, `filePath`. Why: a re-render passes only the block data plus `data-literal-*` values (confirmed in `nodes/editable.ts` `getLiteralProps`/`getNewValue`); the docs name `data-literal-*` for values the caller computes. Importing `allBlogs` in the component would put 1 MB of post bodies in the editor chunk. `lib/pages.ts` `resolveBlocks` returns `{ block, literals }`; `Blocks` spreads literals as props and as attributes.
  - `author_profile.authorDetails` / `bioCode`: removed. `AuthorProfile` looks the author up from `author` itself (cross-collection select pattern), so changing the select re-renders it with the new author. The author's fields and bio are `@file` regions on `/data/authors/<slug>.mdx`, the docs' pattern for cross-collection items. `resolveBlocks` still throws on an unknown slug at build.
- **Post authors and tags are registered components bound with `data-prop-authors` / `data-prop-tags`.** Both are multiselects; the docs require a registered component with the lookup inside for selects that reference another collection. Array regions don't fit: the items are slugs chosen in the input, not text typed on the page.
- **`@file` titles and summaries for other posts** (home list, prev/next), per the cross-collection items rule. Paths are `/data/` + contentlayer's `filePath`, extension included (`lib/files.ts`).
- **Header stays unregistered** with primitive `@data` regions: it renders kbar, next-themes and Headless UI consumers that need providers the editor's isolated React roots lack. The nav renders every item, hiding Home with `hidden`, so array positions match `navigation.json`.
- **Footer is a registered component on `@data[site]`.** The credit is conditional and the icons hide on empty URLs, so field edits need a re-render. `Footer` imports `site.json` and wraps `FooterContent` in a `<footer>` host, keeping the same DOM.
- **`PageTitle` forwards attributes** so title regions sit on the existing `<h1>`.
- **Default author rule:** `PostAuthors` and the post route both use `authors?.length ? authors : ['default']`, so an emptied multiselect (`[]`) shows the default author as the input comment says.
- **Blog `date` input** gets a comment that the page updates after the next build.
- **No editor click guard on text regions inside links** (open question 1).
- **Mobile nav dialog mounts after hydration**, so the server HTML and the first client render match (see § Hydration). The menu works as before: the dialog is in the portal, hidden, until the button opens it.

## Files changed

Phase scope: `app/layout.tsx`, `app/[slug]/page.tsx`, `app/cloudcannon/componentMap.ts`, `app/cloudcannon/registerComponents.ts` (new), `components/CloudCannonEditor.tsx` (new), `components/RawTemplate.tsx` (new), `components/PostAuthors.tsx` (new), `components/PostTags.tsx` (new), `components/Blocks.tsx`, `components/blocks/{PageHeader,LatestPosts,ProjectGrid,AuthorProfile}.tsx`, `components/Card.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/PageTitle.tsx`, `layouts/Post{Layout,Simple,Banner}.tsx`, `lib/authors.ts` (new), `lib/files.ts` (new), `lib/pages.ts`, `css/tailwind.css`, `package.json`, `yarn.lock`.

Hydration fix: `components/MobileNav.tsx`.

Cross-phase (small, mechanical): `cloudcannon.config.yml` (blog `date` comment; validated against the local schema with ajv, since the CLI wasn't available), `app/blog/[...slug]/page.tsx` (default-author rule matches `PostAuthors`).

## Open questions

1. **Text regions inside links** (header title and nav, footer title and credit, home post titles, project card titles, prev/next titles): clicking one in the Visual Editor follows the link. Default: no guard; editors use the sidebar or the item's panel for these. Alternative: an editor-only capture-phase click listener in `CloudCannonEditor` that cancels clicks landing in a text region inside an `<a>`.
2. **`@file` regions on author files and other posts** are untested in CloudCannon (the `authors` collection has no `visual` editor; it isn't required for `@file`, but unconfirmed here). Default: keep. Phase 5: on `/about/`, edit the author's occupation inline and save, then check the diff lands in `data/authors/default.mdx`. If it fails, remove the `@file` attributes and leave those fields read-only on the page.
3. **A `latest_posts` block added in the editor** shows "No posts found." until the next build, because only built blocks carry `data-literal-posts`. Default: accept.
4. **`data-literal-posts` also ships on Vercel** (~5 KB on `/`, no behaviour change). Default: keep. Alternative: emit the attribute only when `CLOUDCANNON_EXPORT=true`.
