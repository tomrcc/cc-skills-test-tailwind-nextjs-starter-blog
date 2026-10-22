import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import Gallery from './Gallery'

export const components: MDXComponents = {
  Image,
  TOCInline,
  Gallery,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
}
