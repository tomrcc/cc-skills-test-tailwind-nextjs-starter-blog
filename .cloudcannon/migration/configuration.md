# Configuration

Phase 2 of the CloudCannon migration. Input: `audit.md` and the user's answers to its blocking question.

## Checklist

Shared checklist (`cloudcannon-configuration/configuration.md`) and Next.js checklist (`cloudcannon-configuration/nextjs/configuration.md`).

### Blocking gates

- [x] JSON schemas downloaded to `.cloudcannon/migration/*.schema.json` (gitignored)
- [x] Structures rules: every array/object input links `_structures.<name>` by full path; every structure value has `preview` and `picker_preview`; field completeness is checked against content in Phase 3, when the page files exist
- [x] `npx @cloudcannon/cli validate` passes: `cloudcannon.config.yml`, `.cloudcannon/initial-site-settings.json`, `.cloudcannon/routing.json`

### Files

- [x] `cloudcannon.config.yml` exists and is valid YAML; no `source`, no YAML anchors, no comments
- [x] Build settings nested under `build` in `.cloudcannon/initial-site-settings.json`
- [x] The build command produces the complete output: `EXPORT=1 UNOPTIMIZED=1 yarn build` exits 0, 56 HTML files, `out/feed.xml` and `out/tags/<tag>/feed.xml` written, no headers warning. The two variables are set in `build.environment_variables`
- [x] `.cloudcannon/README.md` written for editors

### Collections

- [x] Every audit collection has a `collections_config` entry: `blog`, `authors`, `pages`, plus `data` for the site settings files
- [x] No defunct keys; no collections over `app/`, `components/` or `faq/` (the CLI baseline had all three; removed)
- [x] No single-file collection
- [x] `collection_groups`: Content (pages, blog, authors), Site (data)
- [x] Every collection has a `url` with a trailing slash, or `disable_url: true` (`authors`, `data`)
- [x] URL check against `out/`: all 11 blog files match `/blog/[full_slug]/`, including `nested-route/…` and the draft (which exports the 404 page in production, as the audit records). The five `pages` files don't exist yet; their target paths `/`, `/blog/`, `/tags/`, `/about/`, `/projects/` all exist in `out/`. Re-run for `pages` in Phase 3
- [x] Index pages with different fields have their own schema (`listing`, `about`)

### Inputs

- [x] Every front matter key in `blog` and `authors` has an explicit input (key list taken from all 13 files); `canonicalUrl` is defined in Contentlayer but no file uses it and no template reads it, so it has no input and isn't in the schema
- [x] Every `select`/`multiselect` has its options: `tags` → `data.tags`; `authors` and `about.author` → `collections.authors`; `layout` inline; social `kind` → `_select_data.social_kinds`
- [x] No icon fields; enum-like keys inside structures (`kind`) have inputs on the structure value
- [x] No numeric front matter mapped to text
- [x] Developer-only keys hidden: `_schema` (pages), `layout` (authors)
- [x] `file_config` uses the array format

### Images

- [x] `paths.static: public`, `paths.uploads: public/static/images` (where every existing image lives; content references them as `/static/images/…`)

### Editors

- [x] `_enabled_editors`: pages `[visual, content, data]` (page builder, listing, about schemas `[visual, data]`); blog `[visual, content, data]`; authors `[content, data]` (no page of their own); data `[data]`

### Content specifics

- [x] No styled HTML in front matter; no `<br />` lists
- [x] `markdown.options.table: true` (`github-markdown-guide.mdx` has Markdown tables)
- [x] Every switch/select has a conditional render: `draft` (production filters drafts), `layout` (layout map), `asDisclosure` (pliny `TOCInline`)
- [x] No `type: markdown` inputs
- [x] No YAML anchors, aliases or merge keys
- [x] Schema defaults mean the same as an absent key, except two that need a template fix in Phase 3 (see below)
- [x] Data-file-backed selects use `values: data.<name>`
- [x] No `length === 0 ? showAll : showSelected` toggles

### Schemas and the Add button

- [x] `add_options` on every collection editors add to; `listing` and `about` are left off the menu (one-off pages with their own routes)
- [x] Every key used in `blog` and `authors` files is in its schema
- [x] `_schema` values planned for Phase 3 (`page_builder`, `listing`, `about`) are keys under `pages.schemas`
- [x] `data` has `disable_add: true`
- [x] `page_builder` has `new_preview_url: /projects/`; `default` page, blog post and author add options use `editor: content`
- [x] Blog (has `draft`) uses `editor: content`
- [x] Page builder schema exists (3 block types: `page_header`, `recent_posts`, `project_grid`)

### Next.js

- [x] `"ssg": "nextjs"`, `output_path: out`, no `next export`
- [x] `output: "export"` and `images.unoptimized` when `EXPORT`/`UNOPTIMIZED` are set; both set for CloudCannon builds (see Decisions)
- [x] No collection over `app/` or `pages/`
- [x] `pages` files with hard-coded routes: `listing` and `about` are off the Add menu; creatable schemas render through `app/[slug]/page.tsx` (Phase 3)
- [x] Data files for regions are JSON (Phase 3 creates them)

### Snippets (`cloudcannon-snippets`)

- [x] Component inventory (outside code fences): `TOCInline` (3 uses, 2 files) → `toc_inline`; `BlogNewsletterForm` removed with the newsletter. Inline HTML: the gallery grid → `gallery` (after the Phase 3 `Gallery` component); `<video>` → `video`; photo-credit `<div>`s → plain paragraphs in Phase 3. KaTeX math → `math_block`, `math_inline`
- [x] `snippet: true` in `_editables.content`; `escape_snippets_in_code_blocks: true`
- [x] Snippet inputs configured (`src` image/url, LaTeX as code/text); gallery uses `view: gallery`; picker previews are literal
- [ ] Round-trip of each snippet in the Content Editor — needs CloudCannon (Phase 5)
- [ ] No `^import ` in MDX content — none outside code fences today; recheck after Phase 3

## Files changed

- `cloudcannon.config.yml` — new (CLI baseline replaced)
- `.cloudcannon/initial-site-settings.json` — install `yarn install --immutable`, build `yarn build`, `node_version: "24"`, `EXPORT=1` and `UNOPTIMIZED=1` in `environment_variables`
- `.cloudcannon/routing.json` — security headers from `next.config.js`
- `.cloudcannon/schemas/` — `post.mdx`, `author.mdx`, `page.md`, `page-builder.md`, `listing.md`, `about.md`
- `.cloudcannon/README.md` — editor guide
- `.gitignore` — `.cloudcannon/migration/*.schema.json`
- `next.config.js` — `headers()` and the header constants removed
- `app/api/newsletter/route.ts` — deleted (with the empty `app/api/` folders)
- `app/Main.tsx` — `NewsletterForm` removed
- `components/MDXComponents.tsx` — `BlogNewsletterForm` removed from the map
- `data/blog/new-features-in-v1.mdx` — the live `<BlogNewsletterForm />` removed; the code-fence example of it stays, since the post documents the component
- `data/siteMetadata.js` — CSP comments point at `.cloudcannon/routing.json`

## Decisions and why

- **Newsletter removed** (user answer) — the route doesn't export and both forms POST to it. `siteMetadata.newsletter` and the newsletter keys in `.env.example` are now unused; left for Phase 3 to delete with the other `siteMetadata` changes.
- **Security headers in `.cloudcannon/routing.json`** (user answer) — same values, minus `X-Frame-Options: DENY`. The CSP has no `frame-ancestors`, so it doesn't block the Visual Editor frame. `match: "*"` follows CloudCannon's only published example; the reference calls `match` a glob and the article calls it a regex, so Phase 5 checks the headers on a nested page.
- **`EXPORT` switch kept** (audit decision, user answer) — `next.config.js` still reads `EXPORT`, `UNOPTIMIZED` and `BASE_PATH`; CloudCannon builds get `EXPORT=1` and `UNOPTIMIZED=1` through `build.environment_variables`, so `build_command` stays `yarn build` and `scripts/rss.mjs` writes feeds to `out/`. A local export build is `EXPORT=1 UNOPTIMIZED=1 yarn build`. `initial-site-settings.json` applies only when the site is created; on an existing site set the same two variables in Site Settings.
- **Install `yarn install --immutable`, Node 24** — Yarn 3 via the committed `yarnPath`; Node 24 per the audit default (no `.nvmrc`/`engines`).
- **Timezone `Etc/UTC`** — the CLI wrote the machine's zone. The site sets none, dates are date-only strings and Contentlayer reads them as UTC.
- **Pages collection at `data/pages/`**, not `content/pages/` — Contentlayer reads only `data/` (`contentDirPath`), and the audit keeps `data/` as the content root. Files: `index.md` and `projects.md` (`_schema: page_builder`), `blog.md` and `tags.md` (`_schema: listing`), `about.md` (`_schema: about`). URL `/[slug]/`.
- **About page is a `pages` entry that points at an author** — the `authors` collection can't have a `url` that is right for both files (`default` builds `/about/`, `sparrowhawk` builds nothing), and per-file URLs don't exist. `about.md` holds the heading (`title`) and `author: default`; the route renders that author's card and bio. `authors` gets `disable_url: true` and opens in the Content Editor. Open question 1.
- **Page builder blocks** — `page_header` (`title`, `description`: home "Latest" + site description, projects heading + intro), `recent_posts` (`count`, default 5 = `MAX_DISPLAY`), `project_grid` (`projects[]` of `title`, `description`, `imgSrc`, `href`, the `Card` prop names). Inline `_structures` (fewer than 5 types). `_type` is the discriminator and the `blockMap` key.
- **Listing schema** — `title` (`<title>`: "Blog", "Tags"), `heading` (on-page: "All Posts", "Tags"), `description` (meta; blog has none, so it falls back to the site description as now).
- **Creatable page types** — Page Builder (previews at `/projects/`) and a plain Page (title, description, body, opens in the Content Editor). Both render through `app/[slug]/page.tsx`.
- **Post `layout` is an editor select** (Standard/Simple/Banner, empty = Standard) — it is a per-post presentation choice the route branches on, not a routing key.
- **Dates use `type: date`** — every template shows dates only; one post has a full datetime (`new-features-in-v1.mdx`), which a date input saves as a date on its first edit. Same day, no visible change.
- **Tags** — `multiselect` over a new `data/tags.json` (array of strings, seeded in Phase 3 from tags in use), with `allow_create`. `app/tag-data.json` is generated by every build, so editors can't own it.
- **Site settings as JSON data files in `data/`** — `site.json` (title, author, headerTitle, description, email, socialBanner), `navigation.json` (array of `{title, href}`), `social.json` (array of `{kind, href}`; mail stays from `site.email`). All four files are in `data_config` for selects and Phase 4 `@data[...]` regions. Nav and social items have no `id`: they're ordered lists nothing references.
- **Snippets**
  - `toc_inline` is a raw snippet with `toc={props.toc}` as literal text, so existing content needs no change and new tables of contents get the expression automatically.
  - `gallery` is a self-closing `<Gallery images={[...]} />`, per the snippets skill's gallery rule; Phase 3 builds the component.
  - `video` matches the one `<video controls><source … type="video/webm" /></video>`.
  - `math_block` and `math_inline` keep KaTeX source raw, so the rich text editor doesn't escape it.
- **Snippets left out** — footnotes (`[^1]`), citations (`[@Nash1950]`) and GitHub alerts (`> [!CAUTION]`) have no snippet; whether the editor preserves them is a Phase 5 check (open question 4).

## For Phase 3

1. **Contentlayer**: add a `Page` document type for `data/pages/*.md` that declares every front matter key, including `_schema`, `content_blocks` (`json`), `heading` and `author`. Undeclared keys log `onExtraFieldData` warnings. Set `contentDirInclude: ['blog', 'authors', 'pages']` so the new JSON files in `data/` aren't read as unknown documents.
2. **Create `data/pages/`** files with the values now in code: home (`page_header` "Latest" + the current site description, `recent_posts` 5), projects (`page_header` "Projects" + "Showcase your projects with a hero image (16 x 9)", `project_grid` from `projectsData.ts`), blog (`title: Blog`, `heading: All Posts`), tags (`title: Tags`, `heading: Tags`, `description: Things I blog about`), about (`title: About`, `author: default`). Every structure field present on every item, including `href`/`imgSrc` when empty.
3. **Routes**: `app/page.tsx`, `app/blog/page.tsx`, `app/blog/page/[page]/page.tsx`, `app/tags/page.tsx` and `app/about/page.tsx` read their page entry. Add `app/[slug]/page.tsx` (Blocks or markdown body; excludes `index`, `blog`, `tags`, `about`), `generateMetadata` from front matter, `Blocks` + `blockMap` keyed on `_type`. Delete `app/projects/` and `data/projectsData.ts`. `AuthorLayout` takes its heading from the about page.
4. **Data files**: create `data/site.json`, `data/navigation.json`, `data/social.json`, `data/tags.json` (tags in use; mixed `next js` / `next-js` both slug to `next-js` — keep the spellings in use). `siteMetadata.js` reads `site.json` (keeps the `BASE_PATH` prefix on `socialBanner`), `headerNavLinks.ts` reads `navigation.json`, `Footer` maps `social.json`. Delete `siteMetadata.newsletter`.
5. **Template fixes for schema defaults**: `images: []` must behave like no `images` — in `generateMetadata` (`post.images?.length`) and the `structuredData` computed field in `contentlayer.config.ts`. `authors` defaults to `[default]` in the schema, so no change there.
6. **Gallery**: add `components/Gallery.tsx` (`images: {src, alt}[]`, the current grid classes, `Image` per item guarded on `src`), add it to `components/MDXComponents.tsx`, and replace the grid in `pictures-of-canada.mdx` (outside the code fence) with `<Gallery images={[…]} />`.
7. **Photo credits** in `pictures-of-canada.mdx`: replace the four `<div>` blocks with plain paragraphs (same text and links).
8. Normalize the `<video>` in `release-of-tailwind-nextjs-starter-blog-v2.0.mdx` only if the snippet doesn't match it in Phase 5.

## Open questions

1. **About page model** — default: `data/pages/about.md` points at an author; the bio stays in `data/authors/default.mdx`. On `/about/` the Visual Editor edits the heading; the author's fields and bio are edited under Authors (or through Phase 4 regions bound to that file). Alternative: move the bio into `about.md` so it's edited on the page.
2. **Timezone** — default `Etc/UTC`. Set your own IANA zone if you publish posts with times.
3. **CSP and the Visual Editor** — default: the CSP is carried across unchanged apart from framing. If the editor preview loads scripts from another origin, the CSP may block them; Phase 5 checks the editor and the live headers.
4. **Footnotes, citations and alerts in the Content Editor** — default: no snippets. If editing a post with them escapes the brackets (`\[^1\]`), we add raw snippets or limit those posts to the Data and Source editors.
5. **Gallery snippet with an `images` array** — default: `mdx_component` with an array argument. If it doesn't round-trip in CloudCannon, the fallback is a paired `<Gallery>` wrapping markdown images.
