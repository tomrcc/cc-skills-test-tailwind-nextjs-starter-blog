import SocialIcon, { type SocialKind } from './social-icons'

// Footer icon size, so editor re-renders match the build. A new item has no kind until one is picked.
export default function SocialLink({
  kind,
  href,
}: {
  kind: SocialKind | null
  href: string | null
}) {
  if (!kind || !href) return null
  return <SocialIcon kind={kind} href={href} size={6} />
}
