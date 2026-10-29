// `@file` paths start at the repo root; contentlayer's filePath is relative to `data/`.
export function contentFile(filePath: string): string {
  return `/data/${filePath}`
}
