'use client'

import { useEffect } from 'react'

export default function CloudCannonEditor() {
  useEffect(() => {
    if (!(window as { inEditorMode?: boolean }).inEditorMode) return
    import('../app/cloudcannon/registerComponents').catch((error) => {
      console.warn('Failed to load CloudCannon component registration:', error)
    })
  }, [])

  return null
}
