'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
  textMagnify: boolean
  setTextMagnify: (v: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  textMagnify: false,
  setTextMagnify: () => {},
})

const TEXT_TAGS = new Set(['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'LABEL', 'LI', 'A', 'TD', 'TH'])
const MAGNIFY_RATIO = 1.12

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textMagnify, setTextMagnifyState] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('amor-fati-text-magnify')
    if (stored === 'true') {
      setTextMagnifyState(true)
    }
  }, [])

  // Attach hover listeners whenever textMagnify changes
  useEffect(() => {
    if (!textMagnify) return

    function onOver(e: MouseEvent) {
      const el = e.target as HTMLElement
      if (!TEXT_TAGS.has(el.tagName)) return
      // Don't re-magnify if already magnified by a parent
      if (el.dataset.magnified) return
      const computed = parseFloat(window.getComputedStyle(el).fontSize)
      el.dataset.magnified = '1'
      el.dataset.origFontSize = el.style.fontSize
      el.style.transition = 'font-size 0.15s ease'
      el.style.fontSize = (computed * MAGNIFY_RATIO) + 'px'
    }

    function onOut(e: MouseEvent) {
      const el = e.target as HTMLElement
      if (!TEXT_TAGS.has(el.tagName)) return
      if (!el.dataset.magnified) return
      el.style.fontSize = el.dataset.origFontSize ?? ''
      delete el.dataset.magnified
      delete el.dataset.origFontSize
    }

    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      // Clean up any currently magnified elements
      document.querySelectorAll('[data-magnified]').forEach(el => {
        const htmlEl = el as HTMLElement
        htmlEl.style.fontSize = htmlEl.dataset.origFontSize ?? ''
        delete htmlEl.dataset.magnified
        delete htmlEl.dataset.origFontSize
      })
    }
  }, [textMagnify])

  function setTextMagnify(v: boolean) {
    setTextMagnifyState(v)
    localStorage.setItem('amor-fati-text-magnify', String(v))
  }

  return (
    <AccessibilityContext.Provider value={{ textMagnify, setTextMagnify }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  return useContext(AccessibilityContext)
}
