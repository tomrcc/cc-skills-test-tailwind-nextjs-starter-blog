# Content

Phase 3 of the CloudCannon migration. Input: `audit.md`, `configuration.md` (its "For Phase 3" list and decisions).

## Checklist

Shared review checklist (`migrate-to-cloudcannon/content.md`), Next.js content and page-building docs, structures field completeness.

### Review checklist

- [x] Required fields present in every file — every `blog` and `authors` file now has every schema key; missing keys added as bare keys, `images: []` or `authors: ['default']`
- [x] Defaults written into files — `authors: ['default']` (the code default) and `images: []` written where absent
- [x] Every key in the schema — all keys used in `blog`, `authors` and `pages` files are in their schema files; `draft` explicit everywhere
- [x] `draft` — explicit in every post; blog add option already opens in the Content Editor
- [x] Dates — left as is per the Phase 2 decision (one unquoted ISO datetime in `new-features-in-v1.mdx`; the date input saves it as a date on first edit)
- [x] Image paths — one convention, `/static/images/…` from `public/`
- [x] Field naming — matches component props (`imgSrc`, `href` from `Card`; `title`, `description`)
- [x] Mixed-type fields — `images` is an array everywhere (no string form in content)
- [x] Content references — `authors`, `about.author` use selects (Phase 2)
- [x] Body components — `Gallery` built and used; `TOCInline` unchanged (raw snippet matches it)
- [x] Inline HTML — gallery grid replaced by `<Gallery images={[…]} />`; photo-credit `<div>`s replaced by paragraphs; `<video>` left as is (matches the snippet)
- [x] Styled HTML in front matter — none
- [x] Page-builder content — `index.md`, `projects.md` built from the structures, field by field
- [x] One field per visual slot — listing pages use `title` (`<title>`) and `heading` (on-page) for different slots, as Phase 2 set
- [x] API-driven content — none
- [x] Settings in code → data files — `site.json`, `navigation.json`, `social.json`, `tags.json`; consumers updated; moved values stripped from `siteMetadata.js`
- [x] Data collections — all four JSON files are top-level arrays or a flat object; no nesting over one level

### Review checklist addendum

- [x] Field completeness: every block in `content_blocks` has every key from its structure value (`page_header`: `title`, `description`; `recent_posts`: `count`; `project_grid`: `projects`; each project: `title`, `description`, `imgSrc`, `href`)
- [x] Fields the original page didn't pass hold the resolved default — `count: 5` (was `MAX_DISPLAY`); `description:` empty on page builder pages where the original had no meta description (falls back to the site description as before)
- [x] No block-level HTML in front matter strings
- [x] Arrays in structures link to `_structures` (Phase 2 config; unchanged)
- [x] Visible values in data-file consumers live in the data files (footer icons by `kind`, nav labels and links, header title)
- [x] This note records every structural change

### Phase 2 "For Phase 3" list

- [x] 1. Contentlayer `Page` type for `data/pages/*.md` with `_schema`, `title` (required), `description`, `heading`, `author`, `content_blocks` (`json`); `contentDirInclude: ['blog', 'authors', 'pages']`. Build logs no extra-field or unknown-document warnings
- [x] 2. `data/pages/` files: `index.md`, `projects.md` (`page_builder`), `blog.md`, `tags.md` (`listing`), `about.md` (`about`)
- [x] 3. Routes read their page entry; `app/[slug]/page.tsx`, `components/Blocks.tsx`, `app/cloudcannon/componentMap.ts` (`blockMap`); `app/projects/`, `data/projectsData.ts` and `app/Main.tsx` deleted; `AuthorLayout` takes its heading from `about.md`
- [x] 4. Data files created and wired; `siteMetadata.newsletter` and the newsletter keys in `.env.example` deleted
- [x] 5. `images: []` behaves like no images in `generateMetadata` and the `structuredData` computed field
- [x] 6. `components/Gallery.tsx`, in the MDX component map; `pictures-of-canada.mdx` uses it
- [x] 7. Photo credits are plain paragraphs
- [x] 8. `<video>` unchanged (Phase 5 round-trip check)
- [x] No `^import ` in MDX content outside code fences

### Verification

- [x] `EXPORT=1 UNOPTIMIZED=1 yarn build` exits 0; same 56 HTML files and same non-`_next` file list as the pre-phase build; feeds and sitemap URLs unchanged
- [x] Rendered output compared with the pre-phase build (scripts, build IDs and asset hashes stripped): 52 of 56 pages identical. The four that differ, and why each is visually the same:
  - `/` — each block sits in a wrapper `<div>` inside the `divide-y` container; the border lands in the same place. The "All Posts →" link is now inside the second block rather than after the container; no border is drawn under it either way
  - `/projects/` — the same block wrappers; card descriptions lose the source-indentation whitespace from the old template literals (HTML collapses it anyway)
  - `/about/` — prettier's Tailwind plugin reordered two classes in `AuthorLayout`
  - `/blog/pictures-of-canada/` — gallery `<img>`s render at natural size capped at the column (`width: auto; height: auto`), as before; the `width`/`height` attributes are `0` because remark no longer reads the file dimensions, so no space is reserved before load. Credit `<p>`s lose their wrapping `<div>`
- [x] `<head>` metadata identical on every page, including home (`title.absolute`)
- [x] `pages` URLs: `/`, `/projects/`, `/blog/`, `/tags/`, `/about/` all in `out/`
- [x] A plain `default`-schema page (temporary `data/pages/zz-test-page.md`, removed after) builds at `/zz-test-page/` with its title, body and sitemap entry
- [x] `npx @cloudcannon/cli validate` passes

## Files changed

New:
- `data/pages/index.md`, `projects.md`, `blog.md`, `tags.md`, `about.md`
- `data/site.json`, `data/navigation.json`, `data/social.json`, `data/tags.json`
- `lib/pages.ts` — `getPage(slug)` (throws on a missing file), `getSlugPages()` (pages `app/[slug]` renders)
- `app/[slug]/page.tsx` — page builder or plain markdown body; `generateMetadata` from front matter
- `app/cloudcannon/componentMap.ts` — `blockMap` keyed on `_type`
- `components/Blocks.tsx` — renders `content_blocks` from `blockMap`, throws on an unknown `_type`
- `components/blocks/PageHeader.tsx`, `RecentPosts.tsx`, `ProjectGrid.tsx`
- `components/Gallery.tsx`

Changed:
- `contentlayer.config.ts` — `Page` type, `contentDirInclude`, `images?.length` in `structuredData`
- `app/page.tsx` — renders `index.md` blocks; `<title>` from `title` as an absolute title
- `app/blog/page.tsx`, `app/blog/page/[page]/page.tsx`, `app/tags/page.tsx`, `app/about/page.tsx` — heading and metadata from their page entry
- `app/blog/[...slug]/page.tsx` — `images?.length`
- `app/sitemap.ts` — static routes plus every `app/[slug]` page, so editor-created pages are listed
- `layouts/AuthorLayout.tsx` — `title` prop for the heading
- `data/siteMetadata.js` — reads `site.json`; social URLs and `newsletter` removed
- `data/headerNavLinks.ts` — reads `navigation.json`
- `components/Footer.tsx` — maps `social.json`; `components/social-icons/index.tsx` exports `SocialKind`
- `components/MDXComponents.tsx` — `Gallery`
- `data/blog/*.mdx` (all 11), `data/authors/*.mdx` (both) — missing schema keys added
- `data/blog/pictures-of-canada.mdx` — `<Gallery>`, credit paragraphs
- `.env.example` — newsletter keys removed

Deleted: `app/projects/page.tsx` (and folder), `app/Main.tsx`, `data/projectsData.ts`.

## Decisions and why

- **Page loader is Contentlayer, not `lib/content`** — every route already reads `contentlayer/generated`; `lib/pages.ts` only looks entries up. The `Page` slug comes from `sourceFileName`, because Contentlayer's `flattenedPath` drops `/index` (`pages/index.md` → `pages`).
- **`Page` is `contentType: 'mdx'`** — a plain page's body renders through the same `MDXLayoutRenderer` and component map as posts, so snippets behave the same in both collections.
- **`app/[slug]` renders `page_builder` and `default` pages only** — `index`, `listing` and `about` pages have their own routes. The filter lives in `getSlugPages()`, shared with the sitemap.
- **Block components live in `components/blocks/`** — the site keeps components at the root (`@/components`); `blockMap` sits at `app/cloudcannon/componentMap.ts`, where Phase 4 expects it.
- **`Blocks` has no editable-region attributes yet** — the wrapper and per-item `<div>`s are in place; Phase 4 adds `data-editable="array"`/`array-item`. The wrapper carries the `divide-y` classes both pages used between header and body.
- **`RecentPosts` reads `allBlogs` itself** — the posts list is computed, so the block takes only `count`. `count` empty falls back to 5. Phase 4: the block pulls the generated post index into the client bundle when registered.
- **Home `<title>`** — `index.md` `title` is the site title, set as `title.absolute` so the layout template doesn't append the site name again; output unchanged.
- **Every schema key written into posts and authors** — bare keys parse to `null`; Contentlayer accepts them and omits them from the generated data, and all 11 posts render identically. `images: []` needed the two template fixes above.
- **Social links** — `social.json` keeps the footer's order and only networks that rendered (`twitter` was unset, `mastodon` was never shown); mail stays from `site.email`.
- **Tags list** — the 19 spellings in use, including both `next js` and `next-js` (both slug to `next-js`).
- **Gallery** — `{ src, alt }` items written as JSON objects (quoted keys), the likeliest form for the `mdx_component` serializer. Images use `Image` with `width={0} height={0}` and `width/height: auto`, so each keeps its natural size capped at the column, as the remark-generated images did.

## Open questions

1. **Gallery round-trip** (carries Phase 2 open question 5) — default: JSON object syntax in `<Gallery images={[…]} />`. If CloudCannon rewrites it on save or shows it as an unknown component, fall back to the paired form.
2. **Gallery image dimensions** — default: no reserved space before the images load (natural size after). Alternative: add `width`/`height` to each gallery item, at the cost of two more fields per image for editors.
3. **Mastodon link** — default: dropped, since the footer never showed it. Add a `mastodon` row to Social links to show it.
