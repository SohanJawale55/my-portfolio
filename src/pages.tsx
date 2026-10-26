import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Download, Dribbble, Facebook, Github, Instagram, Link2, Linkedin, Mail, Moon, Palette, Phone, Sun, Twitter, X as CloseIcon, Youtube } from 'lucide-react'
import ProfileCard from './ProfileCard'
import { ToolList } from './ToolIcons'
import { mergeTheme, useThemeKey } from './theme'
import { useContent, type Project, type Social } from './content'

const TINTS = ['#D9DDF5', '#DCE6E1', '#E6E0D6', '#E3DCE6', '#E6D9D6', '#E2E2DA']
const ICONS: Record<string, typeof Github> = { github: Github, linkedin: Linkedin, instagram: Instagram, x: Twitter, behance: Palette, youtube: Youtube, dribbble: Dribbble, facebook: Facebook, mail: Mail, link: Link2 }
function setMeta(name: string, content?: string, og = false) {
  if (!content) return
  const sel = og ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let el = document.head.querySelector<HTMLMetaElement>(sel)
  if (!el) { el = document.createElement('meta'); el.setAttribute(og ? 'property' : 'name', name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
const useTitle = (t: string, desc?: string, image?: string) => useEffect(() => {
  document.title = `${t} — Sohan Jawale`
  setMeta('description', desc); setMeta('og:title', t, true); setMeta('og:description', desc, true)
  setMeta('og:image', image ? new URL(image, location.origin).href : undefined, true)
}, [t, desc, image])

function A({ href, className, style, children }: { href: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  if (href.startsWith('#')) return <Link className={className} style={style} to={`/${href}`}>{children}</Link>
  if (href.startsWith('/')) return <Link className={className} style={style} to={href}>{children}</Link>
  const ext = /^https?:/i.test(href)
  return <a className={className} style={style} href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
}
function Reveal({ children }: { children: ReactNode }) {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = r.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={r} className="rv">{children}</div>
}
function ThemeToggle() {
  const [t, setT] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const flip = () => {
    const n = t === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = n
    try { localStorage.setItem('theme', n) } catch { /* private mode */ }
    setT(n)
  }
  return <button className="icon-btn" onClick={flip} aria-label={t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{t === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
}
function SocialIcons({ items }: { items: Social[] }) {
  if (!items.length) return null
  return (
    <ul className="sico">{items.map((s) => { const I = ICONS[s.icon] ?? Link2; return <li key={s.id}>{s.url ? <A className="sbtn" href={s.url}><I size={20} aria-hidden="true" /><span className="sr">{s.label}</span><span className="tip" aria-hidden="true">{s.label}</span></A> : <span className="sbtn" aria-label={s.label}><I size={20} aria-hidden="true" /></span>}</li> })}</ul>
  )
}
export function Layout() {
  const { pathname, hash } = useLocation()
  const { footer: f, contact, socials } = useContent()
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { setMenuOpen(false) }, [pathname, hash])
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="brand" to="/">Sohan Jawale</Link>
          <nav className={`links${menuOpen ? ' open' : ''}`} aria-label="Primary">
            <Link to="/#work">Work</Link>
            <NavLink to="/services">Freelance services</NavLink>
            <Link to="/#about">About</Link>
            <Link to="/#contact">Contact</Link>
          </nav>
          <div className="tools">
            <ThemeToggle />
            <Link className="btn p nav-cta" to="/#contact">Hire me</Link>
            <button className="ham" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <div className="fband"><footer className="wrap site">
        <div className="ft-top">
          <div className="ft-brand">
            <Link className="brand" to="/">Sohan Jawale</Link>
            {f.text && <p className="ft-tagline">{f.text}</p>}
          </div>
          {f.show_nav && <nav className="ft-nav" aria-label="Footer">
            <Link to="/#work">Work</Link>
            <Link to="/services">Services</Link>
            <Link to="/#about">About</Link>
            <Link to="/#contact">Contact</Link>
          </nav>}
          {f.show_socials && <SocialIcons items={socials} />}
        </div>
        <div className="ft-bottom">
          <p className="mute">{f.copyright}</p>
          {f.show_contact && (contact.email || contact.phone) && (
            <p className="mute">{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}{contact.email && contact.phone && ' · '}{contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>}</p>
          )}
        </div>
      </footer></div>
    </>
  )
}
/** Live floating line: skills scroll sideways in a loop, bob gently, pause on hover. */
function SkillMarquee({ items, label, className = '', reverse = false }: { items: string[]; label: string; className?: string; reverse?: boolean }) {
  if (!items.length) return null
  const reps = Math.max(2, Math.ceil(12 / items.length))
  const loop = Array.from({ length: reps }, () => items).flat()
  const dur = Math.round(loop.length * 2.4)
  const style = { '--mq-dur': `${dur}s` } as CSSProperties
  return (
    <div className={`ab-mq ${reverse ? 'mq-rev' : ''} ${className}`} style={style} aria-label={`${label}: ${items.join(', ')}`}>
      <div className="ab-mq-track">
        {[0, 1].map((g) => (
          <ul key={g} className={`ab-mq-group ${className === 'ab-sk' ? 'ab-skills' : ''}`} aria-hidden={g === 1 ? 'true' : undefined}>
            {loop.map((k, n) => <li key={`${k}-${n}`} className={n >= items.length ? 'dup' : undefined} style={{ animationDelay: `${(n % items.length) * -0.6}s` }}>{k}</li>)}
          </ul>
        ))}
      </div>
    </div>
  )
}
function Cover({ p, i }: { p: Project; i: number }) {
  const src = p.cover || p.images[0]
  return <div className="cover" style={{ background: TINTS[i % TINTS.length] }}>{src ? <img src={src} alt={p.title} loading="lazy" /> : <span className="note">Cover not uploaded</span>}</div>
}
function WorkSection({ limit }: { limit?: number }) {
  const { projects } = useContent()
  const [f, setF] = useState('All')
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)).filter((p) => f === 'All' || p.category.includes(f))
  const shown = limit ? list.slice(0, limit) : list
  return (
    <>
      <div className="chips" role="group" aria-label="Filter projects">{['All', 'Design', 'Development'].map((c) => <button key={c} className="chip" aria-pressed={f === c} onClick={() => setF(c)}>{c}</button>)}</div>
      {shown.length === 0 ? <p className="mute">No projects in this category yet.</p> : (
        <div className="grid">{shown.map((p, i) => (
          <Reveal key={p.id}><Link className="card" to={`/work/${p.slug}`}><Cover p={p} i={i} /><div className="meta"><h3>{p.title}</h3><span className="role">{p.category}</span></div><p>{p.short}</p></Link></Reveal>
        ))}</div>
      )}
    </>
  )
}
function Lanyard({ image }: { image: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const tk = useThemeKey()
  useEffect(() => {
    const w = window as unknown as { THREE?: unknown; initLanyard?: (el: HTMLElement, img: string | null) => (() => void) | undefined }
    if (!ref.current || !w.THREE || !w.initLanyard) return
    const stop = w.initLanyard(ref.current, image || null)
    return () => { stop?.() }
  }, [image, tk])
  return (
    <div className="lan" ref={ref} role="img" aria-label="Interactive card showing my portrait. Drag to swing it, click to flip.">
      <div className="box">{image ? <img src={image} alt="Sohan Jawale" /> : <span>About image not uploaded yet</span>}</div>
    </div>
  )
}
function ContactSection() {
  const { contact: c, socials } = useContent()
  const linkedin = socials.find((s) => s.icon === 'linkedin')
  const behance = socials.find((s) => s.icon === 'behance')
  const cards: { id: string; I: typeof Mail; label: string; value: string; href: string }[] = [
    { id: 'email', I: Mail, label: 'Email', value: c.email || 'Not added yet', href: c.email ? `mailto:${c.email}` : '#' },
    { id: 'phone', I: Phone, label: 'Phone', value: c.phone || 'Not added yet', href: c.phone ? `tel:${c.phone.replace(/\s/g, '')}` : '#' },
    { id: 'linkedin', I: ICONS['linkedin'], label: 'LinkedIn', value: linkedin?.url ? 'Connect with LinkedIn' : 'Not added yet', href: linkedin?.url || '#' },
    { id: 'behance', I: ICONS['behance'], label: 'Behance', value: behance?.url ? 'Connect with Behance' : 'Not added yet', href: behance?.url || '#' },
  ]
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{c.heading}</h2>
      <p className="lead">{c.text}</p>
      <div className="connect4">{cards.map(({ id, I, label, value, href }, i) => (
        <A key={id} className="conn4" href={href} style={{ '--i': i } as React.CSSProperties}>
          <span className="ci4"><I size={22} aria-hidden="true" /></span>
          <span className="conn4-text"><small>{label}</small><strong>{value}</strong></span>
          <ArrowUpRight className="go" size={18} aria-hidden="true" />
        </A>
      ))}</div>
    </div>
  )
}
export function Home() {
  useTitle('Creative Designer & Frontend Developer')
  const { hero: h, about: a, experience, services, socials, theme } = useContent()
  useThemeKey()
  const mode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  const pal = mergeTheme(theme)[mode]
  return (
    <>
      <div className="wrap hero2">
        <div className="hero-copy">
          <h1><span className="ln"><span>{h.title}</span></span><span className="ln"><span>{h.heading}</span></span></h1>
          <p className="id">{h.subtitle}</p>
          <p className="lead">{h.description}</p>
          <div className="cta">
            {h.primary_label && h.primary_url && <A className="btn p" href={h.primary_url}>{h.primary_label}</A>}
            {h.secondary_label && h.secondary_url && <A className="btn" href={h.secondary_url}>{h.secondary_label}</A>}
          </div>
        </div>
        <div className="hero-visual">
          <ProfileCard name="" title="" handle={h.card_handle || ''} status={h.card_status || ''} contactText={h.card_contact || 'Contact'}
            avatarUrl={h.image} avatarAlt={h.image_alt || h.card_name || 'Portrait of Sohan Jawale'} theme={mode} backdropColor={pal.primary} className="hero-card"
            showUserInfo={false}
            onContactClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </div>
      <section id="work" className="wrap"><h2>Selected work</h2><WorkSection limit={6} /><p><Link className="btn" to="/work">All projects</Link></p></section>
      <section id="disciplines" className="band"><div className="wrap"><h2>Two disciplines, one workflow</h2>
        <div className="two">{services.map((s) => (
          <div key={s.id}><h3>{s.title}</h3><p>{s.description}</p><SkillMarquee items={s.skills} label={s.title} className="two-mq" />{s.tools && <ToolList tools={s.tools} />}</div>
        ))}</div>
      </div></section>
      <section id="about" className="wrap about">
        <Lanyard image={a.image} />
        <div className="ab">
          <p className="ab-eyebrow">About me</p>
          <p className="big-p">{a.heading}</p>
          <p className="lead">{a.description}</p>
          {a.skills.length > 0 && <>
            <h3 className="ab-label">Skills</h3>
            <SkillMarquee items={a.skills} label="Skills" className="ab-sk" />
          </>}
          {experience.length > 0 && <>
            <h3 className="ab-label">Experience</h3>
            <ol className="tl">{experience.map((x) => (
              <li className="tl-i" key={x.id}>
                <div className="tl-top"><h4>{x.title}</h4><span className="tl-date">{x.start}{x.end ? ` – ${x.end}` : ''}</span></div>
                <p className="tl-co">{x.company}</p>
                {x.description && <p className="tl-d">{x.description}</p>}
                {x.responsibilities.length > 0 && <ul className="bul">{x.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>}
              </li>
            ))}</ol>
          </>}
          <div className="ab-cta">
            {a.resume_url && <a className="btn p dl" href={a.resume_url} download><Download size={18} aria-hidden="true" /> Download resume</a>}
            <A className={a.resume_url ? 'btn' : 'btn p'} href="#contact">Let's work together</A>
            <SocialIcons items={socials} />
          </div>
        </div>
      </section>
      <section id="contact" className="wrap"><ContactSection /></section>
    </>
  )
}
export function Work() { useTitle('Work'); return <section className="wrap"><h1 className="h">Work</h1><WorkSection /></section> }
export function NotFound() { useTitle('Not found'); return <section className="wrap"><h1 className="h">Page not found</h1><p className="lead">That page doesn't exist. <Link to="/">Go to the homepage</Link> or see the <Link to="/work">work</Link>.</p></section> }
function Lightbox({ images, index, title, onClose, onIndex }: { images: string[]; index: number; title: string; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('button')?.focus()
    return () => { document.body.style.overflow = ''; before?.focus() }
  }, [])
  useEffect(() => {
    const go = (d: number) => onIndex((index + d + images.length) % images.length)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'Tab') {
        const f = ref.current?.querySelectorAll<HTMLElement>('button')
        if (!f?.length) return
        const first = f[0], lastEl = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus() }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, onIndex])
  const many = images.length > 1
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={`${title} image gallery`} ref={ref} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <button className="lb-x" onClick={onClose} aria-label="Close gallery"><CloseIcon size={22} aria-hidden="true" /></button>
      {many && <button className="lb-n lb-p" onClick={() => onIndex((index - 1 + images.length) % images.length)} aria-label="Previous image"><ChevronLeft size={26} aria-hidden="true" /></button>}
      <figure><img src={images[index]} alt={`${title} screenshot ${index + 1}`} /><figcaption>{index + 1} / {images.length}</figcaption></figure>
      {many && <button className="lb-n lb-nx" onClick={() => onIndex((index + 1) % images.length)} aria-label="Next image"><ChevronRight size={26} aria-hidden="true" /></button>}
    </div>
  )
}
export function ProjectPage() {
  const { slug } = useParams()
  const { projects } = useContent()
  const i = projects.findIndex((x) => x.slug === slug)
  const p: Project | undefined = projects[i]
  const [open, setOpen] = useState<number | null>(null)
  useEffect(() => { setOpen(null) }, [slug])
  useTitle(p?.title ?? 'Project', p?.short, p ? p.cover || p.images[0] : undefined)
  if (!p) return <NotFound />
  const feat = p.cover || p.images[0] || ''
  const all = p.images.length ? p.images : feat ? [feat] : []
  const prev = projects[i - 1], next = projects[i + 1]
  const facts = [['Category', p.category], ['Year', p.year], ['Industry', p.industry], ['Client', p.client], ['Duration', p.duration]].filter(([, v]) => v)
  return (
    <article className="wrap pj">
      <p className="mute"><Link to="/work">Work</Link> / {p.title}</p>
      <h1 className="h">{p.title}</h1>
      <p className="lead">{p.short}</p>
      <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="cta">
        {p.live_url && <A className="btn p" href={p.live_url}>View live project</A>}
        {p.source_url && <A className="btn" href={p.source_url}>Source code</A>}
      </div>
      {feat ? <button className="pj-feat" onClick={() => setOpen(Math.max(0, all.indexOf(feat)))} aria-label={`Open featured image of ${p.title}`}><img src={feat} alt={`${p.title} featured`} decoding="async" fetchPriority="high" /></button> : <Cover p={p} i={0} />}
      {p.detail && <p className="detail">{p.detail}</p>}
      {p.tech.length > 0 && <ul className="tags">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>}
      {p.images.length > 0 && (<><h2 className="sub">Gallery</h2><div className="gal">{p.images.map((src, n) => (
        <button key={src} className="gal-i" onClick={() => setOpen(n)} aria-label={`Open image ${n + 1} of ${p.images.length}`}><img src={src} alt={`${p.title} screenshot ${n + 1}`} loading="lazy" decoding="async" /></button>
      ))}</div></>)}
      <nav className="pn" aria-label="Project navigation">
        {prev ? <Link className="btn" to={`/work/${prev.slug}`} rel="prev"><ArrowLeft size={16} aria-hidden="true" /> {prev.title}</Link> : <span />}
        <Link className="btn p" to="/work">Back to Projects</Link>
        {next ? <Link className="btn" to={`/work/${next.slug}`} rel="next">{next.title} <ArrowRight size={16} aria-hidden="true" /></Link> : <span />}
      </nav>
      {open !== null && <Lightbox images={all} index={open} title={p.title} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </article>
  )
}
export function Services() {
  const { freelance = [], contact } = useContent()
  useTitle('Freelance Services', 'Freelance design services: UI/UX, landing pages, websites, logos and mobile apps.')
  return (
    <section className="wrap">
      <h1 className="h big">Freelance Services</h1>
      <p className="lead">Design for products, pages and brands. Pick a service and I'll pick up the conversation from there.</p>
      <div className="fl-grid">{freelance.map((s, i) => (
        <Reveal key={s.id}>
          <article className="fl-card">
            <div className="fl-img" style={{ background: TINTS[i % TINTS.length] }}>{s.image ? <img src={s.image} alt={`${s.title} illustration`} loading="lazy" decoding="async" /> : <span className="note">Image not uploaded</span>}</div>
            <div className="fl-body"><h2>{s.title}</h2><p>{s.description}</p>
              <A className="btn p" href={contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent('Enquiry: ' + s.title)}` : '#contact'}>Enquire about {s.title.toLowerCase()}</A></div>
          </article>
        </Reveal>
      ))}</div>
    </section>
  )
}