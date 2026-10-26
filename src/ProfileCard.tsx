import { memo, useEffect, useRef, type CSSProperties } from 'react'
import { Mail } from 'lucide-react'
import './ProfileCard.css'

type Mode = 'dark' | 'light'
type Props = {
  avatarUrl?: string; avatarAlt?: string; iconUrl?: string; miniAvatarUrl?: string; name?: string; title?: string; handle?: string; status?: string; statusColor?: string
  contactText?: string; showUserInfo?: boolean; onContactClick?: () => void; theme?: Mode; backdropColor?: string; radius?: number; holo?: number; glare?: number
  enableTilt?: boolean; tiltStrength?: number; parallax?: number; intro?: boolean; className?: string
}
type Axis = { p: number; v: number; target: number }
const THEMES: Record<Mode, Record<string, string>> = {
  dark: { '--pc-frame': 'rgba(38, 35, 46, 0.66)', '--pc-frame-edge': 'rgba(255, 255, 255, 0.08)', '--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)', '--pc-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)', '--pc-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)', '--pc-tile-edge': 'rgba(255, 255, 255, 0.07)', '--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)', '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)', '--pc-ink': '#f4f4f5', '--pc-muted': 'rgba(244, 244, 245, 0.6)', '--pc-hover': 'brightness(1.12)', '--pc-press': 'brightness(0.8)', '--pc-shade': 'rgba(0, 0, 0, 0.4)' },
  light: { '--pc-frame': 'rgba(240, 240, 243, 0.8)', '--pc-frame-edge': 'rgba(24, 24, 27, 0.07)', '--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)', '--pc-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)', '--pc-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)', '--pc-tile-edge': 'rgba(24, 24, 27, 0.08)', '--pc-tile-highlight': 'rgba(255, 255, 255, 1)', '--pc-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)', '--pc-ink': '#27272a', '--pc-muted': 'rgba(39, 39, 42, 0.6)', '--pc-hover': 'brightness(0.97)', '--pc-press': 'brightness(0.92)', '--pc-shade': 'rgba(24, 24, 27, 0.14)' },
}
const FOILS: Record<Mode, Record<string, string>> = {
  dark: { '--pc-blend': 'color-dodge', '--pc-holo-filter': 'hue-rotate(0deg)', '--pc-sheen': 'rgba(255, 255, 255, 0.16)' },
  light: { '--pc-blend': 'multiply', '--pc-holo-filter': 'invert(1) hue-rotate(180deg)', '--pc-sheen': 'rgba(255, 255, 255, 0)' },
}
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>")}")`
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const isDark = (color: string): boolean | null => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!m) return null
  const hex = m[1].length === 3 ? m[1].replace(/./g, (d) => d + d) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5
}

function ProfileCard({ avatarUrl = '', avatarAlt, iconUrl, miniAvatarUrl, name = '', title = '', handle = '', status = '', statusColor = '#22c55e', contactText = 'Contact', showUserInfo = true, onContactClick, theme = 'dark', backdropColor, radius = 16, holo = 0.8, glare = 0.5, enableTilt = true, tiltStrength = 12, parallax = 8, intro = true, className = '' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef({ enableTilt, tiltStrength, parallax, intro })
  settingsRef.current = { enableTilt, tiltStrength, parallax, intro }
  const writeRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const size = { width: root.offsetWidth, height: root.offsetHeight }
    const x: Axis = { p: 0, v: 0, target: 0 }
    const y: Axis = { p: 0, v: 0, target: 0 }
    const light = { p: 0, target: 0 }
    let raf = 0, last = 0, slowUntil = 0
    let touchId: number | null = null

    const write = () => {
      const { enableTilt: on, tiltStrength: strength, parallax: depth } = settingsRef.current
      const angle = on && !reduced ? strength : 0
      const tilt = Math.min(1, Math.hypot(x.p, y.p))
      const s = root.style
      s.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`)
      s.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`)
      s.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`)
      s.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`)
      s.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`)
      s.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`)
      s.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`)
      s.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`)
      s.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`)
      s.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`)
      s.setProperty('--pc-reach', tilt.toFixed(4))
      s.setProperty('--pc-tilt', (tilt * light.p).toFixed(4))
      s.setProperty('--pc-active', light.p.toFixed(4))
    }
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      const slow = now < slowUntil
      const stiffness = slow ? 24 : 120, damping = slow ? 9 : 16
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)))
      const h = dt / steps
      for (let i = 0; i < steps; i++) for (const a of [x, y]) { a.v += (stiffness * (a.target - a.p) - damping * a.v) * h; a.p += a.v * h }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau))
      write()
      const moving = Math.abs(x.target - x.p) > 0.0005 || Math.abs(y.target - y.p) > 0.0005 || Math.abs(x.v) > 0.0005 || Math.abs(y.v) > 0.0005 || Math.abs(light.target - light.p) > 0.002
      if (moving) raf = requestAnimationFrame(frame)
      else { x.p = x.target; y.p = y.target; light.p = light.target; write(); raf = 0 }
    }
    const wake = () => { if (raf) return; last = performance.now(); raf = requestAnimationFrame(frame) }
    const aim = (nx: number, ny: number, on = true) => { x.target = clamp(nx, -1, 1); y.target = clamp(ny, -1, 1); light.target = on ? 1 : 0; slowUntil = 0; wake() }
    const aimAt = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      if (!r.width || !r.height) return
      aim(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
    }
    const release = () => aim(0, 0, false)
    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') aimAt(e) }
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse' || e.pointerId === touchId) aimAt(e) }
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') release() }
    const onDown = (e: PointerEvent) => { if (e.pointerType === 'mouse') return; touchId = e.pointerId; aimAt(e) }
    const onUp = (e: PointerEvent) => { if (e.pointerId !== touchId) return; touchId = null; release() }
    root.addEventListener('pointerenter', onEnter); root.addEventListener('pointermove', onMove); root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerdown', onDown); root.addEventListener('pointerup', onUp); root.addEventListener('pointercancel', onUp)
    const observer = new ResizeObserver(() => { size.width = root.offsetWidth; size.height = root.offsetHeight; write() })
    observer.observe(root)
    writeRef.current = write
    if (settingsRef.current.intro && !reduced) { x.p = 0.62; y.p = -0.55; light.p = 1; slowUntil = performance.now() + 1400; write(); wake() } else write()
    return () => {
      cancelAnimationFrame(raf); observer.disconnect()
      root.removeEventListener('pointerenter', onEnter); root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', onDown); root.removeEventListener('pointerup', onUp); root.removeEventListener('pointercancel', onUp)
    }
  }, [])
  useEffect(() => { writeRef.current() }, [enableTilt, tiltStrength, parallax])

  const palette: Mode = theme === 'light' ? 'light' : 'dark'
  const foil: Mode = backdropColor ? ((isDark(backdropColor) ?? palette === 'dark') ? 'dark' : 'light') : palette
  const backdrop = backdropColor ? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${backdropColor}, #000000 18%) 100%)` : 'var(--pc-tile)'
  const style = {
    ...THEMES[palette], ...FOILS[foil], '--pc-radius': `${Math.max(0, radius)}px`, '--pc-backdrop': backdrop, '--pc-holo': clamp(holo, 0, 1), '--pc-glare': clamp(glare, 0, 1),
    '--pc-parallax': `${Math.max(0, parallax)}px`, '--pc-status': statusColor, '--pc-grain': GRAIN, '--pc-pattern': iconUrl ? `url("${iconUrl}")` : 'linear-gradient(#000, #000)',
    '--pc-pattern-size': iconUrl ? '180% auto' : '100% 100%', '--pc-holo-gain': iconUrl ? 1.25 : 0.75, '--pc-holo-detail': iconUrl && foil === 'dark' ? 1 : 0,
  } as CSSProperties
  return (
    <div ref={rootRef} className={`profile-card ${className}`.trim()} style={style}>
      <div className="profile-card__body">
        <div className="profile-card__tile">
          <span className="profile-card__sheen" />
          <span className="profile-card__holo"><span className="profile-card__holo-glow" /><span className="profile-card__holo-shift" /></span>
          {avatarUrl && <img className="profile-card__photo" src={avatarUrl} alt={avatarAlt ?? name} width={680} height={850} decoding="async" fetchPriority="high" draggable={false} />}
          {(name || title) && (<><span className="profile-card__scrim" /><div className="profile-card__info">{name && <h2 className="profile-card__name">{name}</h2>}{title && <p className="profile-card__title">{title}</p>}</div></>)}
          <span className="profile-card__tile-rim" />
        </div>
        {showUserInfo && (
          <div className="profile-card__footer">
            {miniAvatarUrl && <span className="profile-card__avatar"><img src={miniAvatarUrl} alt="" loading="lazy" draggable={false} /></span>}
            {(handle || status) && <div className="profile-card__meta">{handle && <span className="profile-card__handle">@{handle}</span>}{status && <span className="profile-card__status">{status}</span>}</div>}
            {contactText && <button type="button" className="profile-card__contact" onClick={onContactClick} aria-label={name ? `${contactText} ${name}` : contactText}><Mail size={16} strokeWidth={1.8} aria-hidden="true" />{contactText}</button>}
          </div>
        )}
        <span className="profile-card__glare" /><span className="profile-card__shade" /><span className="profile-card__rim" />
      </div>
    </div>
  )
}
export default memo(ProfileCard)
