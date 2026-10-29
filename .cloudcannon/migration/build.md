# Phase 5 — Build and test

Site: `tailwind-nextjs-starter-blog` (Next.js 15.5.12 App Router, React 19.2.4, contentlayer2 0.5.8, Yarn 3.6.1). Inputs: `audit.md`, `configuration.md`, `content.md`, `visual-editing.md`. Production stays on Vercel; CloudCannon is for editing only.

All builds ran on Node 20.16.0 (`.nvmrc` holds `20`, `build.node_version: file`), with Yarn from the committed `yarnPath`.

## Checklist

Tracked here (no todo tool). `migrate-to-cloudcannon/build.md`, then `nextjs/build.md`.

### Shared
- [x] **Full build.** Deleted `node_modules/`, `.next/`, `out/`, `.contentlayer/`. Ran `install_command` and `build_command` from `initial-site-settings.json` with `CLOUDCANNON_EXPORT=true`: exit 0, 60 static pages, contentlayer 16 documents, search index and RSS written.
- [x] **Frozen install.** `yarn install --immutable` with an empty project cache (`YARN_CACHE_FOLDER` pointed at a new folder): exit 0. Yarn's global mirror in `~/.yarn/berry` may have served the archives, so this proves the lockfile is frozen-clean, not a cold network fetch. Warnings only: peer-dependency notes (pliny wants older React) and `YN0009 sharp couldn't be built` (sharp falls back to a source build attempt; its prebuilt binary is installed, and the export sets `images.unoptimized`, so nothing uses it).
- [x] **Regions are in the output.** See § Regions.
- [x] **Config validates.** `npx @cloudcannon/cli validate` (CLI 0.0.20): `cloudcannon.config.yml`, the five `components/blocks/*.cloudcannon.structure-value.yml` and `.cloudcannon/initial-site-settings.json` all valid, exit 0.
- [x] **Collection URLs match the build.** `blog` (`/blog/[full_slug]/`): all 11 files have `out/blog/<path>/index.html`, including `nested-route/…` and `release-of-…-v2.0`. `pages` (`/[slug]/`): `index.md` → `out/index.html`, `about.md` → `out/about/index.html`, `projects.md` → `out/projects/index.html`. `authors`, `settings`: `disable_url`.
- [x] **Schema keys resolve.** `_schema: page_builder` in all three `pages` files is a key under `pages.schemas`. Blog and author files name no `_schema` and use `default`, which exists. Every `add_options[].schema` (`page_builder`, `default` ×3) resolves.
- [x] **Search index.** kbar local search: contentlayer's `onSuccess` writes `public/search.json` inside `next build`; `out/search.json` exists. No Pagefind.
- [x] **Schema round-trip.** Blog files lack some of `authors`, `bibliography`, `images`, `lastmod`, `layout`; authors lack `bluesky` (and `email`/`github` in `sparrowhawk`). Backed up `data/blog` and `data/authors` to a gitignored folder, filled every missing key with the schema's empty value, rebuilt the export, and compared every HTML page's visible text with the normal build: 0 of 56 pages differ, same page set, `feed.xml` byte-identical, `app/tag-data.json` unchanged. Restored the backup (`diff -r` clean) and deleted it.
- [ ] **No hydration errors.** No browser in this session. Handed to the user (§ Human checklist, step 1).
- [ ] **Hand off.** § Human checklist.

### Next.js
- [x] **Clean build.** As above.
- [x] **Export mode.** `CLOUDCANNON_EXPORT=true` turns on `output: "export"` and `images.unoptimized`; the build prints the expected `headers`-under-export warnings and writes `out/`. `/api/newsletter` is listed as `ƒ` and left out of `out/` (no `out/api/`), as decided in the audit (Q1 option 3).
- [x] **Every page is in the output.** `/`, `/about/`, `/projects/`, `/blog/`, `/blog/page/1–3/`, all 11 posts (draft `my-fancy-title` builds as the not-found view, audit Q3), `/tags/`, 17 tag pages and their pagination, `404.html`, `sitemap.xml`, `robots.txt`, `feed.xml`, tag feeds.
- [x] **Counting regions.** § Regions.
- [x] **Images load.** 13 distinct `<img src>` across `out/`: 11 resolve to files under `out/`, 2 are real remote hosts (`github.githubassets.com`, `vercel.com/button`).
- [x] **Base path.** None on CloudCannon (`BASE_PATH` unset).
- [x] **Build command and settings.** `build` runs `next build` (contentlayer inside it) then `postbuild.mjs` (RSS). `initial-site-settings.json`: `install_command: yarn install --immutable`, `build_command: yarn build`, `output_path: out`, `node_version: file`, `preserved_paths: node_modules/,.next/`, `CLOUDCANNON_EXPORT=true`. `cloudcannon configure detect-build-commands` agrees (`yarn build`, `out`, same preserved paths).

### Default (Vercel) build
- [x] `yarn build` without `CLOUDCANNON_EXPORT`, after deleting `.next/` and `.contentlayer/`: exit 0. `ƒ /api/newsletter` present, `/about` and `/projects` prerendered under `/[slug]`, RSS written to `public/feed.xml` (gitignored). No tracked file changed.

## Regions

`grep -rhoE 'data-editable="[a-z_-]+' out --include='*.html' | sort | uniq -c`: `_dynamic` 54 (one root per page), `array` 58, `array-item` 332, `component` 70, `image` 13, `text` 153. Text regions written as `<editable-text>` elements are not in that count.

Spot checks (`data-prop` / `data-component` per page):

- `/`: `content_blocks` with `page_header`, `latest_posts`, `newsletter`; 5 `@file[/data/blog/…].title` + 5 `.summary`; `@data[navigation].items`; `@data[site].headerTitle`; footer component on `@data[site]` with `author`, `title`, `themeCredit.text`.
- `/about/`: `author_profile` with `heading`; `@file[/data/authors/default.mdx]` `name`, `occupation`, `company`, `avatar` (image), `@content`.
- `/projects/`: `page_header`, `project_grid` with `items`, 2 cards each with `title`, `description`, `imgSrc` image.
- `/blog/introducing-tailwind-nextjs-starter-blog/` (Standard): `title`, `@content`, `post_authors` (two authors' `@file` name + avatar), `post_tags`, prev/next `@file` titles.
- `/blog/new-features-in-v1/` (Simple): `title`, `@content`, prev/next `@file` titles.
- `/blog/pictures-of-canada/` (Banner): `title`, `@content`, `images.0` image, prev/next `@file` titles.

## Commands

Run from the site root, on Node 20 (`nvm use`).

- Install: `node .yarn/releases/yarn-3.6.1.cjs install --immutable` (or `corepack yarn install --immutable`)
- CloudCannon build: `CLOUDCANNON_EXPORT=true node .yarn/releases/yarn-3.6.1.cjs build` → exit 0
- Default (Vercel) build: `node .yarn/releases/yarn-3.6.1.cjs build` → exit 0
- Validate: `npx @cloudcannon/cli validate` → exit 0
- Site dev server: `node .yarn/releases/yarn-3.6.1.cjs dev` (Next dev on http://localhost:3000; not the export, `/api/newsletter` works)
- CloudCannon dev server (two terminals):
  1. `CLOUDCANNON_EXPORT=true node .yarn/releases/yarn-3.6.1.cjs build` — re-run after each batch of edits; `cloudcannon dev` never builds
  2. `npx @cloudcannon/cli dev out --port 10101`, then open http://localhost:10101 (Ctrl-C stops it). The built home page is at http://localhost:10101/__output/index.html
  Commit or stash first: app sync writes each edit straight to disk. `git diff` afterwards; expect whitespace-only front matter changes beside real ones.

## Human checklist (CloudCannon)

Create the CloudCannon site from this repo. `initial-site-settings.json` sets the build on creation; on an already-created site, set install `yarn install --immutable`, build `yarn build`, output `out`, Node version from `.nvmrc`, and env var `CLOUDCANNON_EXPORT=true` in Site Settings before building. Answer each yes/no unless it asks for a line.

1. **Hydration.** Open the hosted preview of `/`, `/about/`, `/projects/`, `/blog/introducing-tailwind-nextjs-starter-blog/`, `/blog/new-features-in-v1/` and `/blog/pictures-of-canada/` with the browser console open. Any React hydration error (#418/#423/#425 or "Hydration failed")? If yes, paste the first one.
2. **Build.** Does the first CloudCannon build succeed? If no, paste the last 30 lines of the build log.
3. **Home, text.** Pages > Home in the Visual Editor: click the "Latest" heading and type a word. Does the text change in place?
4. **Home, blocks.** Do the Sections show add/remove/reorder controls on the page header, latest posts and newsletter blocks?
5. **Home, `@file`.** Edit the first post title in the latest-posts list and save. Does the commit change only `title` in `data/blog/<that post>.mdx`?
6. **Header nav.** Edit a nav link label in the header and save. Does the commit change only that `title` in `data/settings/navigation.json`?
7. **Footer.** Edit the footer credit text ("Tailwind Nextjs Theme") and save. Does the commit change only `themeCredit.text` in `data/settings/site.json`?
8. **Projects, array.** On Pages > Projects, do the project cards show add/remove/reorder controls?
9. **Projects, image.** Click a project card image. Does the image picker open?
10. **About, `@file` text.** On Pages > About, edit the occupation ("Professor of Atmospheric Science") inline and save. Does the commit change `occupation` in `data/authors/default.mdx` (and not `data/pages/about.md`)?
11. **About, `@file` bio.** Edit one word of the bio on `/about/` and save. Does the commit change only that word in the body of `data/authors/default.mdx`?
12. **About, avatar.** Click the avatar. Does the image picker open, and does a saved change land in `avatar` of `data/authors/default.mdx`?
13. **Blog post body.** In `/blog/introducing-tailwind-nextjs-starter-blog/` (Visual Editor), edit one word of the body and save. Does the diff of `data/blog/introducing-tailwind-nextjs-starter-blog.mdx` show only that word changed?
14. **Banner image.** On `/blog/pictures-of-canada/`, click the banner image. Does the image picker open?
15. **Snippet: TOC.** Open `data/blog/release-of-tailwind-nextjs-starter-blog-v2.0.mdx` in the Content Editor. Does the `<TOCInline …>` line show as a "Table of contents" snippet? Change one word of the body and save. Does the diff show only that word (the `<TOCInline toc={props.toc} exclude="Introduction" />` line untouched)?
16. **Snippet: alert.** Open `data/blog/introducing-tailwind-nextjs-starter-blog.mdx` in the Content Editor. Does the `> [!CAUTION]` block show as an Alert snippet? Change one word elsewhere and save. Does the diff show only that word?
17. **Snippet: footnotes.** Open `data/blog/github-markdown-guide.mdx` in the Content Editor. Change one word and save. Does the diff show only that word (every `[^1]` marker and `[^1]: My reference.` line unchanged)?
18. **Snippet: citation.** Open `data/blog/new-features-in-v1.mdx` in the Content Editor. Change one word and save. Does the diff show only that word, including the uncovered forms `@Nash1951` and `[see @Nash1950; @Nash1951, page 50]`?
19. **Math post.** Does `data/blog/deriving-ols-estimator.mdx` open with only the Data and Source editors offered?

Send back: the page URL and what you clicked for any "no", and the diff line for any unexpected change.

## Decisions and why

- **Builds ran on Node 20.16.0**, matching `.nvmrc` and `node_version: file`. The machine default is Node 24.
- **Hydration left to the user.** No browser here; the checklist names one page per layout.
- **No code changed in this phase.** Every check passed without a fix.
- **Footnote check uses `github-markdown-guide.mdx`**, whose only extension syntax is footnotes, so a failing diff points at one snippet. The TOC check uses the v2.0 post rather than `new-features-in-v1.mdx`, which mixes TOC, footnotes and citations.

## Things a real user would hit

- **Install warning `YN0009 sharp couldn't be built`** appears in every install. It doesn't fail the install, and the export doesn't optimise images.
- **Newsletter forms 404 in CloudCannon previews** (home block and the `BlogNewsletterForm` snippet). Expected: the API route exists on Vercel only.
- **Images are unoptimised in the CloudCannon preview**, since that build turns optimisation off. Vercel still optimises.
- **`initial-site-settings.json` is read only when the site is created.** On an existing CloudCannon site the build settings and `CLOUDCANNON_EXPORT=true` must be set by hand.
- **`cloudcannon configure detect-build-commands` suggests `yarn`** as install, and `npx next build && npx next export` as a second build. Neither applies: `yarn install --immutable` and `yarn build` are set.

## Open questions

1. **Snippet round-trips** (`toc_inline`, `alert`, `footnote_*`, `citation`) are untested until checks 15–18. Default: keep; a failing post moves to `_enabled_editors: [data]` like the math post.
2. **`@file` saves on author files** (checks 10–12). Default: keep; if they fail, remove the `@file` attributes on `/about/` and post author cards and leave those fields read-only on the page.
3. **Text regions inside links** follow the link on click (visual-editing.md Q1). Default: no guard.
