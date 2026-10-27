import { createContext, useContext, type ReactNode } from 'react'
import { ThemeApplier, type Theme } from './theme'
import profile from './data/profile.json'
import skills from './data/skills.json'
import projects from './data/projects.json'
import experience from './data/experience.json'
import services from './data/services.json'
import freelance from './data/freelance.json'
import socialLinks from './data/social-links.json'
import settings from './data/settings.json'

export type Project = { id: string; title: string; slug: string; category: string; short: string; detail: string; tech: string[]; images: string[]; cover: string; year: string; industry: string; client: string; duration: string; live_url: string; source_url: string; featured: boolean; published: boolean; home_order?: number }
export type Exp = { id: string; title: string; company: string; start: string; end: string; description: string; responsibilities: string[] }
export type Service = { id: string; title: string; description: string; skills: string[]; tools?: string[] }
export type Freelance = { id: string; title: string; description: string; image: string }
export type Social = { id: string; label: string; url: string; icon: string }
export type Content = {
  hero: { image: string; title: string; heading: string; subtitle: string; description: string; primary_label: string; primary_url: string; secondary_label: string; secondary_url: string; image_alt?: string; card_name?: string; card_handle?: string; card_status?: string; card_contact?: string }
  about: { image: string; heading: string; description: string; resume_url: string; skills: string[] }
  experience: Exp[]; projects: Project[]; services: Service[]; socials: Social[]
  contact: { heading: string; text: string; email: string; phone: string }
  footer: { text: string; copyright: string; show_socials: boolean; show_contact: boolean; show_nav: boolean }
  freelance: Freelance[]; theme: Partial<Theme>
}
export const Ctx = createContext<Content | null>(null)
export function useContent(): Content {
  const c = useContext(Ctx)
  if (!c) throw new Error('Content not loaded')
  return c
}
/** Static data stores root-relative asset paths (/images/..., /resume/...). Prefix the deploy base so subpath hosting (GitHub Pages) works. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const withBase = <T,>(v: T): T => {
  if (typeof v === 'string') return (/^\/(images|resume)\//.test(v) ? BASE + v : v) as T
  if (Array.isArray(v)) return v.map(withBase) as T
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withBase(x)])) as T
  return v
}
// Same shape the old /api/content returned; unpublished projects were never public.
const CONTENT: Content = withBase({
  hero: profile.hero,
  about: { ...profile.about, skills },
  experience, projects: (projects as Project[]).filter((p) => p.published), services,
  socials: socialLinks, contact: profile.contact, footer: settings.footer,
  freelance, theme: settings.theme,
} as Content)
export function ContentProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={CONTENT}><ThemeApplier theme={CONTENT.theme} />{children}</Ctx.Provider>
}