# Feedback: tailwind-nextjs-starter-blog

## `_enabled_editors: [source, data]` is invalid

The skills recommend `_enabled_editors: [source, data]` for files the Content Editor can't round-trip, but `cloudcannon validate` rejects it. The config schema's editor enum is `visual`, `content`, `data` only; the Source Editor is always available and can't be listed or turned off. The migration used `[data]` on the maths post instead.

Docs that recommend it:
- `cloudcannon-snippets/snippets.md` (three places)
- `cloudcannon-snippets/astro/overview.md` (checklist)
- `cloudcannon-configuration/astro/configuration.md` (checklist)
- `migrate-to-cloudcannon/audit.md`
