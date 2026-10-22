# Visual editing

Phase 4 of the CloudCannon migration. Input: `audit.md`, `configuration.md`, `content.md`.

Package: `@cloudcannon/editable-regions` 0.0.22 (React entry point). App Router only.

## Checklist

Tracked here (no todo tool). Sources: `cloudcannon-visual-editing/nextjs/visual-editing.md` (infrastructure, Next.js items, page builder items), `cloudcannon-visual-editing/visual-editing.md` (Universal, page builder, pre-handoff sweep).

### Infrastructure

- [x] `@cloudcannon/editable-regions` in `package.json` dependencies
- [x] `output: "export"` (env-gated on `EXPORT`, set in the CloudCannon build environment — Phase 2 decision)
- [x] `app/layout.tsx` has exactly one `<EditableRegions>`, wrapping header, page `children` and footer
- [x] `<CloudCannonEditor />` rendered in `app/layout.tsx`
- [x] `CloudCannonEditor` imports `registerComponents` with a relative path inside the `inEditorMode` check
- [x] `CloudCannonEditor.tsx` starts with `"use client"`
- [x] No component, map or helper under `pages/` (no `pages/` directory)
- [x] No `@cloudcannon/react-connector`, no `CloudCannonConnect`
- [x] No client component imports `registerReactComponent` or the component map at the top level
- [x] Export build passes after setup

### Universal

- [x] Editor enablement
- [x] Census coverage
- [x] Array containers
- [x] Per-loop census
- [x] Nested editables in array items
- [x] Array path scope
- [x] Array container purity
- [x] Image editables
- [x] Child component labels
- [x] Shared partials backed by data
- [x] Data file completeness
- [x] Cross-collection select wiring
- [x] `_inputs` audit
- [x] Schema-file seed audit
- [x] Markdown body content
- [x] Source editables
- [x] Conditional guards
- [x] Inline vs block text
- [x] Component prop contract
- [x] Cross-collection editable guard
- [x] `<template>` blueprints
- [x] Data file input config

### Page builder

- [x] Array wrapper attributes
- [x] Block items
- [x] Widget nested editables
- [x] Sub-arrays in widgets
- [x] UI component variants
- [x] Component keys match the discriminator
- [x] All block types registered
- [x] Build output verification

### Next.js

- [x] Collection and data file config
- [x] Regions inside the root
- [x] Registration wiring
- [x] Client-safe registered components
- [x] Rich text hosts
- [x] `<template>` blueprints via `RawTemplate`
- [x] Spread props
- [x] Page builder: block items, shared block map, registration keys match `_type`

### Pre-handoff sweep

- [x] Census walk-through
- [x] Shared-UI table walk-through
- [x] Build grep

## Section census

Paths are relative to the file being edited unless prefixed. `@file[/data/…]` paths include the extension, built from Contentlayer's `filePath` (`blog/x.mdx`, `authors/default.mdx`).

| Page | Section | Treatment | Binding plan | Data completeness | Justification |
| --- | --- | --- | --- | --- | --- |
| Home, Projects (`data/pages/index.md`, `projects.md`) | Blocks list | array + component (page builder) | `components/Blocks.tsx`: `data-editable="array" data-prop="content_blocks" data-component-key="_type"` on the `divide-y` wrapper; each existing per-block `<div>` gets `data-editable="array-item" data-component={block._type}` | `_type` values `page_header`, `recent_posts`, `project_grid` all in `blockMap` | — |
| Home, Projects | `page_header` block | component + text | `<h1 data-editable="text" data-prop="title">`; `<p data-editable="text" data-prop="description">` inside the existing `description &&` guard | Both fields in the block | — |
| Home | `recent_posts` block | component + text (`@file`) | Registered `recent_posts`. Per post: title `<editable-text data-prop="@file[/data/<filePath>].title">` inside the link; summary `data-prop="@file[/data/<filePath>].summary"` on its `<div>` | `count` is a number input, not displayed — sidebar, re-renders the block. Post list is computed (sort, drafts, slice) | — |
| Projects | `project_grid` block | component + array + text + image | Registered `project_grid`; `data-editable="array" data-prop="projects"` on the `flex flex-wrap` container; each `Card` root `data-editable="array-item"`; `<editable-text data-prop="title">`, `<p data-editable="text" data-prop="description">`, `data-editable="image" data-prop-src="imgSrc"` on the `<img>` (inside the existing `imgSrc &&` guard) | `href` is a link — sidebar. Image alt is the title | — |
| Blog listing (`blog.md`, `/blog/`) | Heading | text | `ListLayoutWithTags` gets a `titleProp`; `/blog/` passes `heading`, so the mobile `<h1>` and the desktop sidebar label both carry `data-prop="heading"`. The sidebar label shows `title` on blog routes (same text as the hardcoded "All Posts" it replaces) | `title`/`description` are meta — sidebar | — |
| Blog listing | Post list | text (`@file`) | Per post: `<editable-text data-prop="@file[/data/<filePath>].title">`, summary `<div data-prop="@file[/data/<filePath>].summary">` | Dates, tags and pagination are computed | — |
| Blog listing | Tag sidebar, pagination | sidebar-only | — | Computed from `app/tag-data.json` (generated each build) and post counts | Generated: no field holds this text |
| Tags (`tags.md`, `/tags/`) | Heading | text | `<h1 data-editable="text" data-prop="heading">` in `app/tags/page.tsx` | — | — |
| Tags | Tag cloud | sidebar-only | — | Computed from `app/tag-data.json` | Generated each build from post tags; editors change tags on posts |
| About (`about.md`, `/about/`) | Heading | text | `<h1 data-editable="text" data-prop="title">` in `AuthorLayout` | — | — |
| About | Author card + bio | component (select → lookup) + text + image (`@file`) | `<editable-component data-component="about-author" data-prop-author="author">` around registered `AboutAuthor`, which looks the author up from `allAuthors`. Inside, against `@file[/data/<author filePath>]`: avatar `data-prop-src="….avatar"` (guarded), name, occupation, company text regions, bio `data-prop="….@content"` with `data-type="block"` on the `prose` `<div>` | Social icons and email are URL fields on the author file — Authors collection | — |
| Blog post (`/blog/<slug>/`, three layouts) | Title | text | `PageTitle` gets an `editableProp`; layouts pass `title` | — | — |
| Blog post | Body | text (`@content`) | `data-editable="text" data-type="block" data-prop="@content"` on the existing `prose` `<div>` in `PostLayout`, `PostSimple`, `PostBanner`; MDX renders as its children | Body components are snippets (Phase 2) | — |
| Blog post | Banner image (`PostBanner`) | image | `data-editable="image" data-prop-src="images.0"` on the `relative aspect-2/1` wrapper, only when `images` has an entry | The picsum fallback for an empty `images` is a code default, not a field | — |
| Blog post | Author cards (`PostLayout`) | component (multiselect → lookup) | `<editable-component data-component="post-authors" data-prop-authors="authors">` around registered `PostAuthors`, which does the `allAuthors` lookup | Author name, avatar, X handle live on author files | Author fields aren't inline-editable here: they belong to the author files, edited on `/about/` (default author) or in the Authors collection |
| Blog post | Date, tags, layout, draft | sidebar-only | — | `date`/`lastmod` date inputs; `tags` multiselect | Dates must not be text regions; tag text and links are derived (`slug`, `-` joins), so a text region would write the derived form |
| Blog post | Prev/next, back link, edit/discuss links, comments | sidebar-only | — | Computed from other posts and `siteMetadata` | No field holds this text; see open question 1 for the fixed labels |
| Plain page (`default` schema via `app/[slug]`) | Title, body | text + `@content` | `PageTitle editableProp="title"`; `data-editable="text" data-type="block" data-prop="@content"` on the `prose` `<div>` | — | — |
| Tag listings, 404 | — | none | — | Generated / code | Audit: no editable region |
| All pages | Header title | data-file (text) | `data-editable="text" data-prop="@data[site].headerTitle"` on the title `<div>` | — | — |
| All pages | Header logo | sidebar-only | — | `data/logo.svg` imported as a React component | Inline SVG component, no `<img>` to host an image region; a developer asset |
| All pages | Desktop nav | data-file + array | `data-editable="array" data-prop="@data[navigation]"` on the nav `<div>`; each link `data-editable="array-item"` with `<editable-text data-prop="title">`. Home renders with `hidden` instead of being filtered out, so DOM index matches array index. A `RawTemplate` blueprint for new links | `href` — sidebar | — |
| All pages | Mobile nav | sidebar-only | — | Same `navigation.json` | headlessui `Dialog` portals to `document.body`, outside the `EditableRegions` root; the desktop nav edits the same data |
| All pages | Search, theme switch | none | — | kbar / next-themes UI | No content |
| All pages | Footer social icons | data-file + array + component | Social links in a `contents` wrapper `data-editable="array" data-prop="@data[social]" data-component="social-link" data-direction="row"`; each icon in a `<span class="flex" data-editable="array-item">`; registered `SocialLink` (`SocialIcon` at size 6). Parent row `space-x-4` → `gap-x-4` so spacing reaches through the wrapper | `kind` select and `href` — sidebar (icon only, no text) | — |
| All pages | Footer mail icon | sidebar-only | — | `@data[site].email` | Icon only; the value is a `mailto:` href |
| All pages | Footer author, site title | data-file (text) | `@data[site].author`; `<editable-text data-prop="@data[site].title">` inside the home link | Year is computed | — |
| All pages | Footer credit | data-file (text) | New `footerCredit`, `footerCreditUrl` in `data/site.json`; `<editable-text data-prop="@data[site].footerCredit">` inside the link, rendered only when `footerCredit` is set | Was hardcoded | — |

## Files changed

New:
- `components/CloudCannonEditor.tsx` — gated loader; imports `../app/cloudcannon/registerComponents` only when `window.inEditorMode`
- `app/cloudcannon/registerComponents.ts` — registers every `componentMap` entry
- `components/AboutAuthor.tsx` (`about-author`), `components/PostAuthors.tsx` (`post-authors`), `components/SocialLink.tsx` (`social-link`) — registered components that do their own lookups
- `components/RawTemplate.tsx` — `<template>` blueprint host

Changed:
- `app/layout.tsx` — one `<EditableRegions tag="div">` around `SectionContainer` (header, main, footer); `<CloudCannonEditor />` after it
- `app/cloudcannon/componentMap.ts` — `componentMap` spreads `blockMap` and adds the three registered components
- `components/Blocks.tsx`, `components/blocks/PageHeader.tsx`, `ProjectGrid.tsx`, `RecentPosts.tsx`, `components/Card.tsx` — page-builder regions
- `components/PageTitle.tsx` — optional `editableProp`
- `layouts/PostLayout.tsx`, `PostSimple.tsx`, `PostBanner.tsx` — title, `@content` body, banner image, author component
- `layouts/AuthorLayout.tsx` — heading region only; the card moved to `AboutAuthor`
- `layouts/ListLayoutWithTags.tsx` — `titleProp`, `@file` title and summary per post
- `app/about/page.tsx`, `app/blog/page.tsx`, `app/tags/page.tsx`, `app/[slug]/page.tsx` — regions or region props
- `components/Header.tsx` — header title and nav array regions; Home rendered `hidden` instead of filtered out
- `components/Footer.tsx` — social array + component, author/title/credit regions; `space-x-4` → `gap-x-4`
- `data/site.json` — `footerCredit`, `footerCreditUrl` (were hardcoded in `Footer`)
- `cloudcannon.config.yml` — `file_config` inputs for the two new site fields
- `css/tailwind.css` — editor-only `min-height` on empty `content_blocks`/`projects` arrays
- `package.json`, `yarn.lock` — `@cloudcannon/editable-regions` ^0.0.22

## Verification

- `EXPORT=1 UNOPTIMIZED=1 yarn build` exits 0 (lint and type check included); 56 HTML files; `feed.xml` and tag feeds written
- `npx @cloudcannon/cli validate` passes
- Region counts per page in `out/` match the census (home, projects, blog, tags, about, three post layouts). Every `@file` path in the output points at an existing file (`/data/blog/….mdx`, `/data/authors/default.mdx`)
- The `EditableRegions` root comes before `<header>` and closes after `</footer>`; the nav blueprint renders inside `<template>` with an `array-item` root
- Gating: production HTML loads only the `EditableRegions` root (in the shared chunk, as the skill prescribes). The registration chunk (591 KB, it includes the Contentlayer post index) is referenced by no HTML or `.txt` file and loads only through the `inEditorMode` dynamic import
- Every registered component, rendered with the props the editor passes (block objects, `{ authors }`, `{ author }`, social items including empty and half-filled ones), renders without throwing (esbuild bundle + `react-dom/server`, temporary files removed)

## Decisions and why

- **Named prop bindings for select lookups** — `about-author` uses `data-prop-author="author"` and `post-authors` uses `data-prop-authors="authors"`. The React integration calls `createElement(component, value)`, so a bare string or array `data-prop` gives index-keyed props (`{0: "d", …}`). `data-prop-<name>` gives `{ <name>: value }`. These hosts are `<div data-editable="component">`, because the package's JSX types make `data-prop` required on `<editable-component>`
- **Author fields bind to the author file** — on `/about/`, avatar, name, occupation, company and bio use `@file[/data/authors/<file>.mdx]` paths, built from the looked-up author, so a changed `author` select rebinds them on re-render. Social URLs and email stay in the Authors collection
- **Post author cards re-render but aren't inline-edited** — the cards show other files' data; the default author is edited on `/about/`, the rest in Authors
- **Listings edit post title and summary in place** — home and blog listings bind each post's title and summary to its own file with `@file`. Summary appears only on listings, so this is where it can be edited visually; on the post page it stays in the sidebar
- **Blog listing heading** — the desktop sidebar label on blog routes now renders `heading` (same text, "All Posts"), so the heading editors see at desktop width is the editable one. Tag routes keep the hardcoded "All Posts" link
- **Header stays unregistered** — it reads its own data, so it uses `@data` primitives (the Next.js reference's rule) rather than the shared-UI table's "data-file + component". Home is rendered with `hidden` rather than filtered, so DOM index matches `navigation.json`. New links clone the `RawTemplate` blueprint
- **Mobile nav has no regions** — headlessui's `Dialog` portals to `document.body`, outside the root; the desktop nav edits the same file
- **Footer social icons** — array with wrapper `data-component="social-link"`, so a changed network re-renders the icon. Items sit in a `contents` wrapper for array purity; the row uses `gap-x-4` so spacing reaches through it. `SocialLink` renders nothing until both `kind` and `href` are set
- **Footer credit moved to `site.json`** — per the shared-UI table (footer credits → data file); hidden when empty
- **Logo, tag lists, tag cloud, dates, pagination, prev/next and comments have no regions** — reasons in the census
- **Editor CSS** — only for empty `content_blocks`/`projects` arrays, in `css/tailwind.css`; Tailwind 4 builds utilities from source, so `gap-x-4` and `contents` are generated
- **`layouts/ListLayout.tsx`** — no route imports it; left unwired

## For Phase 5 (CloudCannon only)

1. Component regions (`page_header`, `recent_posts`, `project_grid`, `about-author`, `post-authors`, `social-link`) render with no "Failed to find a registered component" card. If they all fail, check whether the CSP in `.cloudcannon/routing.json` blocks the editor's scripts (Phase 2 open question 3)
2. `@file` regions on `/`, `/blog/` and `/about/` open and save to the right file (path format with leading `/data/` and the extension)
3. Changing `author` on `about.md`, and `authors` on a post, re-renders the card
4. Post body (`@content`) edits and snippets save into the `.mdx`; the banner image on `pictures-of-canada` opens the picker for `images[0]`
5. Adding a nav link (blueprint) and a social link (rendered by `social-link`) shows a new item on the canvas
6. Page-builder blocks and project cards add, remove and reorder

## Open questions

1. **Theme UI labels** — "Read more →", "All Posts →" (recent posts), "Learn more →" (project cards), "Previous/Next Article", "Back to the blog", "Discuss on Twitter", "View on GitHub", the "Tags" headings, pagination labels and the 404 copy stay in code. Default: left as is; they are the theme's interface text, the same on every item. Alternative: a `data/ui.json` strings file with `@data` regions, or label fields on the recent-posts and project-card structures
2. **Editing posts from listings** — default: title and summary on `/` and `/blog/` save to each post's file. Alternative: remove those regions if editors find editing another file from a listing confusing
