import { useEffect, useLayoutEffect, useState } from 'react'

export type Palette = { primary: string; secondary: string; accent: string; background: string; card: string; border: string; text: string; button: string; navigation: string; footer: string; cursor: string }
export type Theme = { light: Palette; dark: Palette }
export const TOKENS: { k: keyof Palette; label: string; hint: string }[] = [
  { k: 'primary', label: 'Primary', hint: 'Headline accent, filters, hero card, About card strap' },
  { k: 'secondary', label: 'Secondary', hint: 'Section bands and hero backdrop' },
  { k: 'accent', label: 'Accent', hint: 'Links, underlines, focus rings' },
  { k: 'background', label: 'Background', hint: 'Page background' },
  { k: 'card', label: 'Card', hint: 'Cards and panels' },
  { k: 'border', label: 'Border', hint: 'Lines and outlines' },
  { k: 'text', label: 'Text', hint: 'Headings and body text' },
  { k: 'button', label: 'Button', hint: 'Primary button background' },
  { k: 'navigation', label: 'Navigation', hint: 'Header background' },
  { k: 'footer', label: 'Footer', hint: 'Footer background' },
  { k: 'cursor', label: 'Cursor effect', hint: 'Mouse splash colour on the public site' },
]
export const DEFAULT_THEME: Theme = {
  light: { primary: '#7C3AED', secondary: '#A78BFA', accent: '#7C3AED', background: '#F1F2F0', card: '#E7E9E5', border: '#C9CDC8', text: '#121418', button: '#7C3AED', navigation: '#F1F2F0', footer: '#E7E9E5', cursor: '#7C3AED' },
  dark: { primary: '#A78BFA', secondary: '#8B5CF6', accent: '#A78BFA', background: '#0F1115', card: '#171A20', border: '#2D323B', text: '#ECEDEF', button: '#7C3AED', navigation: '#0F1115', footer: '#171A20', cursor: '#7C3AED' },
}
export const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)
const lum = (h: string) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
export const ratio = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
export const readable = (bg: string) => (ratio(bg, '#ffffff') >= ratio(bg, '#111111') ? '#ffffff' : '#111111')
export function mergeTheme(t?: Partial<Theme>): Theme {
  const m = (d: Palette, x?: Partial<Palette>): Palette => { const o = { ...d }; for (const k of Object.keys(d) as (keyof Palette)[]) { const v = x?.[k]; if (isHex(v)) o[k] = v } return o }
  return { light: m(DEFAULT_THEME.light, t?.light), dark: m(DEFAULT_THEME.dark, t?.dark) }
}
export function themeVars(p: Palette): Record<string, string> {
  return {
    '--primary': p.primary, '--onprimary': readable(p.primary), '--secondary': p.secondary, '--acc': p.accent, '--onacc': readable(p.accent),
    '--bg': p.background, '--surf': p.card, '--line': p.border, '--ink': p.text, '--mute': `color-mix(in srgb, ${p.text} 62%, ${p.background})`,
    '--btn': p.button, '--onbtn': readable(p.button), '--nav': p.navigation, '--foot': p.footer, '--cursor': p.cursor,
  }
}
const css = (v: Record<string, string>) => Object.entries(v).map(([k, x]) => `${k}:${x}`).join(';')
/** Public site only: injects the saved palette as CSS variables. */
export function ThemeApplier({ theme }: { theme?: Partial<Theme> }) {
  const t = mergeTheme(theme)
  const text = `:root{${css(themeVars(t.light))}}:root[data-theme=dark]{${css(themeVars(t.dark))}}`
  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.id = 'site-theme'
    el.textContent = text
    document.head.appendChild(el)
    return () => el.remove()
  }, [text])
  return null
}
/** Changes whenever the visitor flips light/dark, so canvas widgets can re-read the colours. */
export function useThemeKey() {
  const [k, setK] = useState(0)
  useEffect(() => {
    const mo = new MutationObserver(() => setK((x) => x + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return k
}
