# Phase 2 — Configuration

Site: `tailwind-nextjs-starter-blog` (Next.js 15.5.12 App Router, contentlayer2 0.5.8, Yarn 3.6.1). Input: `audit.md` (Q1 answered option 3, Q2 answered; Q3–Q7 on their defaults).

## Checklist

Tracked here (no todo tool). Shared checklist from `cloudcannon-configuration/configuration.md`, then the Next.js one and the snippets one.

### Blocking gates
- [x] Structures: every structure value has its full `value`, `_inputs` per field, `preview`/`picker_preview`; every array links `_structures.<name>` by full path; `images[*]` covers the one array of primitives
- [x] `npx @cloudcannon/cli validate` passes (both files)

### Files
- [x] `cloudcannon.config.yml` exists and is valid YAML
- [x] Build settings nested under `build` in `.cloudcannon/initial-site-settings.json`
- [x] Build command alone produces the full output (`out/` incl. `feed.xml`, tag feeds, `search.json`, `sitemap.xml`, `robots.txt`)
- [x] `.cloudcannon/README.md` written
- [x] Schema JSON files gitignored (`.cloudcannon/migration/*.schema.json`)

### Collections
- [x] Entry for every audit collection: `blog`, `authors`, `pages`; plus `settings` for the new data files
- [x] No defunct keys; no `source`; CLI's `app`, `components`, `faq` collections removed
- [x] No single-file collection
- [x] `collection_groups`: Content (pages, blog), People (authors), Settings (settings)
- [x] Every collection has `url` or `disable_url: true`
- [x] Every file's computed URL checked against `out/` (§ URL check); planned `pages` files checked against their planned routes
- [x] Structures for 5 block types live beside the block components (`components/blocks/*.cloudcannon.structure-value.yml`, `values_from_glob`)
- [x] Index pages: home uses the page-builder schema, same as projects; no differing index schema needed

### Inputs
- [x] Explicit `_inputs` for every editor-facing field (front matter keys listed per collection and diffed)
- [x] Every `select`/`multiselect` has options (`data.tags`, `collections.authors`, inline layout values)
- [x] No icon fields in content
- [x] Enum-like keys in structure values: none (`count` is a number)
- [x] Numeric values on text inputs: none
- [x] Developer-only fields hidden: `_schema`, `bibliography`
- [x] `file_config` uses the array format

### Images
- [x] `paths.static: public`, `paths.uploads: public/static/images` (where the site keeps its images)

### Editors
- [x] `_enabled_editors` defaults: pages `[visual, content, data]`, blog `[visual, content, data]`, authors `[content, data]`, settings `[data]`

### Content specifics
- [x] No styled HTML in front matter; no `<br />` lists
- [x] `markdown.options.table: true` (tables in `github-markdown-guide.mdx`); `strikethrough: true` (`~~` in two posts)
- [x] Booleans/switches: `draft` (filtered in `allCoreContent`), snippet `asDisclosure` (pliny branches on it)
- [x] Every `type: markdown` has its own `options`
- [x] No YAML anchors, aliases or merge keys
- [x] Schema defaults mean the same as an absent key (`draft: false`, `tags: []`, nulls elsewhere; contentlayer treats `null` as missing for optional fields)
- [x] Data-backed selects use `values: data.<name>` / `collections.<name>`
- [x] Tags dataset is a top-level array with an `id` per item and a structure

### Schemas and the Add button
- [x] `add_options` on pages, blog, authors; settings `disable_add`
- [x] Every front matter key in use is in its schema (blog: `canonicalUrl` is declared in contentlayer but used by no file and read by no template, so left out)
- [x] `_schema` values match schema keys (`page_builder`; Phase 3 writes them)
- [x] Creatable schemas: `page_builder` has `new_preview_url: /projects/`; text page, blog post and author open in the Content Editor
- [x] 3+ reusable blocks → page-builder schema

### Next.js
- [x] `"ssg": "nextjs"`, `output_path: out`, no `next export`
- [x] CloudCannon build runs with `output: "export"` and `images.unoptimized`
- [x] Every route in "What changes under export" has its fix (see § Export)
- [x] No collection over `app/`
- [x] `disable_add` where each file has a hard-coded route: none apply (authors build no page per file; pages are rendered by the planned `[slug]` route)
- [x] Collection `url`s resolve to `out/` paths, no `.html`
- [x] Data files are JSON

### Snippets
- [x] Every component and HTML pattern in bodies has a `_snippets` entry, or its file is restricted (`deriving-ols-estimator.mdx`)
- [x] `snippet: true` in `_editables.content`; `escape_snippets_in_code_blocks: true`
- [x] Snippet `_inputs` and previews set; gallery uses `view: gallery`; `picker_preview` uses literals
- [ ] Round-trip in the Content Editor — needs CloudCannon; Phase 5 (see Open questions)

## Export

- `next.config.js`: `CLOUDCANNON_EXPORT === 'true'` turns on `output: "export"` and `images.unoptimized`, alongside the existing `EXPORT`/`UNOPTIMIZED` switches. Unset (Vercel), the build is unchanged.
- `scripts/rss.mjs` writes feeds to `out/` under the same variable. Without this, the export build writes `feed.xml` to `public/` after `next build` has copied `public/`, so `out/` has no feed.
- `.cloudcannon/initial-site-settings.json` sets `CLOUDCANNON_EXPORT=true` under `build.environment_variables`. The file is read only when the site is created; on an existing site add the variable in Site Settings.
- `BASE_PATH` stays unset on CloudCannon. `trailingSlash: true` stays.
- Build check: `CLOUDCANNON_EXPORT=true node .yarn/releases/yarn-3.6.1.cjs build` exits 0. `out/` has every page, `feed.xml`, `tags/<tag>/feed.xml`, `search.json`, `sitemap.xml`, `robots.txt`; no `out/api/`. `app/tag-data.json` regenerates byte-identical.
- Headers (Q2): Next prints `Specified "headers" will not automatically work with "output: export"` and `rewrites, redirects, and headers are not applied when exporting`; the build still exits 0. Nothing in `out/` carries them, and with no `routing.json` the CloudCannon preview sends no `X-Frame-Options`/CSP, so the Visual Editor can frame it. Vercel keeps them.
- `/api/newsletter` (Q1 option 3): left out of the export with no error. Both pliny forms 404 in CloudCannon previews only. Structure and snippet comments tell editors.
- `app/blog/page.tsx` declares `searchParams` but never reads it; the export passes, so it is left alone.
- `yarn install --immutable` with the committed `yarnPath` completes (run in place, existing `node_modules`).

## URL check

`find out -name index.html`, `trailingSlash: true`:

- `blog` (`/blog/[full_slug]/`): all 11 files match, including `nested-route/introducing-multi-part-posts-with-nested-routing.mdx` → `/blog/nested-route/introducing-multi-part-posts-with-nested-routing/` and `release-of-tailwind-nextjs-starter-blog-v2.0.mdx` → `/blog/release-of-tailwind-nextjs-starter-blog-v2.0/`. `my-fancy-title` builds as the not-found view (draft, Q3).
- `pages` (`/[slug]/`), planned: `index.md` → `/` (`out/index.html`), `projects.md` → `/projects/` (`out/projects/index.html`), `about.md` → `/about/` (`out/about/index.html`). `app/projects/` and `app/about/` build them today; `app/[slug]` builds both after Phase 3.
- `authors`, `settings`: `disable_url: true`.

## Files for Phase 3 to create

Config references these; they don't exist yet.

- `data/pages/index.md` (`_schema: page_builder`): `title`, `description`, `content_blocks`: `page_header` (title "Latest", description = current `siteMetadata.description`), `latest_posts` (`count: 5`), `newsletter` (`title: Subscribe to the newsletter`). `app/page.tsx` reads it.
- `data/pages/projects.md` (`_schema: page_builder`): `page_header` (title "Projects", description "Showcase your projects with a hero image (16 x 9)"), `project_grid` with `items` copied from `data/projectsData.ts` (`title`, `description`, `imgSrc`, `href`). Then delete `projectsData.ts` and `app/projects/`; add `app/[slug]/page.tsx` (skip `index`; renders `content_blocks`, or the MDX body for the default schema).
- `data/pages/about.md` (`_schema: page_builder`, `title: About`): one `author_profile` block (`heading: About`, `author: default`). The block component looks the author up in `allAuthors` by slug and renders what `AuthorLayout` renders today (avatar, name, occupation, company, social links, MDX bio). Delete `app/about/`; `app/[slug]` builds `/about/`. Keep `genPageMetadata({ title: 'About' })` equivalent via `generateMetadata` from the page's `title`.
- contentlayer `Page` type for `pages/*.md` declaring `_schema`, `title`, `description`, `content_blocks` (json).
- Block components and `blockMap` keyed on the `_type` values: `page_header`, `latest_posts`, `project_grid`, `newsletter`, `author_profile`. Field names follow the structure-value files in `components/blocks/`, where the components go.
- `data/settings/site.json` (`title`, `author`, `headerTitle`, `description`, `email`, `github`, `facebook`, `youtube`, `linkedin`, `twitter` (empty), `bluesky`, `x`, `instagram`, `threads`, `medium`, `themeCredit: { text, href }`), `navigation.json` (`items: [{ href, title }]` from `headerNavLinks.ts`), `tags.json` (`[{ "id": … }]`, the 19 tags in use: book, canada, code, feature, features, github, guide, hello, holiday, images, markdown, math, multi-author, next js, next-js, ols, reflection, tailwind, writings). `siteMetadata.js` and `headerNavLinks.ts` import them so consumers stay unchanged; the footer hides the credit when its text is empty.
- Add `settings` to contentlayer's `contentDirExclude`, keeping the defaults (`node_modules`, `.git`, `.yarn`, `.cache`, `.next`, `.contentlayer`). contentlayer globs `{,**/}*.{md,mdx,json,yaml,yml}` under `data/` and warns on every JSON file no type matches.
- `components/Gallery.tsx`, added to `components/MDXComponents.tsx`; rewrite the gallery grid in `pictures-of-canada.mdx` (the one outside the code fence) to `<Gallery images={[{ src: "…", alt: "…" }, …]} />` on one line.
- Normalise the `<video>` in `release-of-tailwind-nextjs-starter-blog-v2.0.mdx` to the snippet's pattern (`src` then `type="video/webm"` on one self-closing `<source />`), and check the four credit `<div>`s match `<div>` / content / `</div>`.

## Decisions and why

- **Export gate `CLOUDCANNON_EXPORT`** (Q1 option 3), beside `EXPORT`. `EXPORT` is also what the GitHub Pages workflow sets, so it isn't CloudCannon-only.
- **Data files in `data/settings/` as JSON.** `data/` is the folder the site imports data from; a subfolder keeps them out of contentlayer with one exclude. JSON needs no reader.
- **One `settings` collection** for the three data files, per-file inputs in `file_config`; all three in `data_config`.
- **`siteMetadata` split:** site name, header title, author, description, email, rendered social links and the footer credit (Q7) go to `site.json`. Language, locale, theme, URLs, `stickyNav`, analytics, comments, search, newsletter provider and `BASE_PATH` logic stay in code. `mastodon` isn't rendered anywhere, so it stays in code.
- **Tags as an editor-owned dataset** (`data.tags`, `allow_create` off), seeded from the tags in use. Tags are a reusable list editors extend.
- **Blog `authors`**: multiselect over `collections.authors`, storing `filename_without_ext` (the slug the post route looks up). Schema default `null`, which the route treats as `['default']`.
- **Blog `layout`**: select of the three layouts in the route's map, empty = `PostLayout`. **`bibliography`** hidden.
- **Dates** use `type: date`, matching the quoted `YYYY-MM-DD` values. The one timestamp (`new-features-in-v1.mdx`) is left as is.
- **Page builder with five block types** (`page_header`, `latest_posts`, `project_grid`, `newsletter`, `author_profile`), so structures are split into `components/blocks/*.cloudcannon.structure-value.yml` per the 5+ rule; `project_items` stays shared in the main config. The audit's rich-text block is left out: a markdown field in front matter needs a second renderer, and prose pages get the **Text page** (`default`) schema, whose MDX body contentlayer already compiles. The base layout renders a generic title-and-body page.
- **`pages` is flat** (`*.md`, `disable_add_folder`, flat `create.path`) because `app/[slug]` takes one segment.
- **About is a `pages` entry** (Q1 answered (a)): `data/pages/about.md` with an `author_profile` block holding a heading and an author slug (select over `collections.authors`, stored as `filename_without_ext`, the slug the lookup uses). Defaults `heading: About` and `author: default` are what the page renders today. Authors stay a data collection with `disable_url: true`, opened in the Content Editor because bios are bodies. In the Visual Editor the About page's heading and author choice are page fields; the author's details and bio belong to the author file, so Phase 4 treats them as computed content rather than regions on the page.
- **Snippets:** `TOCInline` raw (the `toc={props.toc}` expression stays literal), `BlogNewsletterForm` via `mdx_component`, `<video>` and credit `<div>` raw, alerts, footnotes and `[@key]` citations raw.
- **Gallery component instead of a raw grid snippet** (changes the audit's choice). `cloudcannon-snippets/SKILL.md` § Common mistakes says editors can't safely edit a raw `<div>` grid of images, and to extract a `<Gallery images={…} />` with an `mdx_component` array snippet.
- **Math post** (`deriving-ols-estimator.mdx`): `_enabled_editors: [data]` via `file_config`. The schema allows only `visual`, `content`, `data` and states the Source Editor can't be disabled, so `[data]` leaves Data + Source.
- **Node 20** (Q3): `.nvmrc` at the site root holds `20`, and `build.node_version: "file"` makes CloudCannon read it, matching CI and Vercel.
- **Install** `yarn install --immutable`, build `yarn build` (the CLI wrote plain `yarn`).
- **Timezone** `Etc/UTC`: the site sets none, and contentlayer reads bare dates as UTC.

## Findings for the skills

- `cloudcannon-snippets/snippets.md`, `cloudcannon-snippets/astro/overview.md`, `cloudcannon-configuration/astro/configuration.md` and `migrate-to-cloudcannon/audit.md` recommend `_enabled_editors: [source, data]`. `cloudcannon validate` rejects it: `$.file_config[3]._enabled_editors[0]: unexpected value source, allowed values: visual, content, data`. The schema says the Source Editor can't be disabled, so `[data]` is the valid form.

## Open questions

1. **About page in the Visual Editor.** Answered: move `/about/` into `pages` as a page-builder page with an `author_profile` block (see Decisions, and Files for Phase 3).
2. **Timezone.** Answered: keep `Etc/UTC`.
3. **Node version.** Answered: Node 20, matching CI and Vercel. `.nvmrc` holds `20` and `build.node_version` is `file`.
4. **New tags.** Answered: picked from Settings > Tags only (`allow_create` off).
5. **Rich-text section on page-builder pages.** Answered: none; prose pages use the Text page schema.
6. **Citation forms no snippet covers** (`[see @Nash1950; @Nash1951, page 50]`, bare `@Nash1951` in `new-features-in-v1.mdx`). Answered: leave them; Phase 5 checks one save.
7. **Snippet round-trips unchecked** for `toc_inline`, `alert`, `footnote_reference`/`footnote_definition` and `citation`. Answered: keep as configured; Phase 5 opens one post per snippet in the Content Editor, saves, and checks the diff. A failing one moves its post to `[data]` like the math post.
