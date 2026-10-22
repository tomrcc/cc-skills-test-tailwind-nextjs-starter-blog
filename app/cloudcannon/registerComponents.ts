import { registerReactComponent } from '@cloudcannon/editable-regions/react'
import { componentMap } from './componentMap'

for (const [key, component] of Object.entries(componentMap)) {
  registerReactComponent(key, component)
}
