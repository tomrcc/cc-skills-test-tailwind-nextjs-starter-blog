# Feedback: tailwind-nextjs-starter-blog

Tested on CloudCannon hosting (branch `migration`, commit `eca9bcb`).

## Home page in the Visual Editor: stray controls and a hydration error

On load, rows of empty region controls (⋮ ··· ⋮) sit beside the logo, under each nav link, under the hero subtitle, beside the first post's title, and in place of the post's "Read more" link.

After an inline edit to the hero title ("Latest" → "Latest!"), the controls under the subtitle and on the post disappear and "Read more" shows again. The logo and nav controls stay.

The console shows a hydration error once the editor loads:

```
Uncaught Error: Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=
```

Also a warning that `/_next/static/css/751d98137602e97f.css` was preloaded but not used.

The About page shows the same error, so checks 2–4 wait for the fix.

Agent's diagnosis: the template's own mobile nav (Headless UI, `unmount={false}`) causes the mismatch, and the template's pre-migration export throws it too. React then re-renders the whole page, which produced the stray controls. Fixed in `components/MobileNav.tsx`; not yet retested on hosting.

The troubleshooting doc attributes this symptom to "a hydration error removed the editor's stylesheets"; the agent says that cause is wrong. The migration also has no step to check the plain export for existing hydration errors before visual editing.

## `_enabled_editors: [source, data]` is invalid

The skills recommend `_enabled_editors: [source, data]` for files the Content Editor can't round-trip, but `cloudcannon validate` rejects it. The config schema's editor enum is `visual`, `content`, `data` only; the Source Editor is always available and can't be listed or turned off. The migration used `[data]` on the maths post instead.

Docs that recommend it:
- `cloudcannon-snippets/snippets.md` (three places)
- `cloudcannon-snippets/astro/overview.md` (checklist)
- `cloudcannon-configuration/astro/configuration.md` (checklist)
- `migrate-to-cloudcannon/audit.md`
