import { blockMap } from 'app/cloudcannon/componentMap'

export interface Block {
  _type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface ResolvedBlock {
  block: Block
  // Computed props, also passed as data-literal-* so editor re-renders receive them.
  literals?: Record<string, unknown>
}

export default function Blocks({ blocks }: { blocks: ResolvedBlock[] }) {
  return (
    <div data-editable="array" data-prop="content_blocks" data-component-key="_type">
      {blocks.map(({ block, literals = {} }, index) => {
        const Component = blockMap[block._type]
        if (!Component) throw new Error(`No block component for _type "${block._type}"`)
        const literalAttributes = Object.fromEntries(
          Object.entries(literals).map(([key, value]) => [
            `data-literal-${key}`,
            JSON.stringify(value),
          ])
        )
        return (
          <div
            key={index}
            data-editable="array-item"
            data-component={block._type}
            {...literalAttributes}
          >
            <Component {...block} {...literals} />
          </div>
        )
      })}
    </div>
  )
}
