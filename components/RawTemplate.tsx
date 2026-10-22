// The editor reads blueprints from template.content, which JSX children never reach.
export default function RawTemplate({ html }: { html: string }) {
  return <template dangerouslySetInnerHTML={{ __html: html }} />
}
