// Runs after `vite build`.
// 1) 404.html copy of index.html: GitHub Pages serves it for unknown paths, so /work/<slug> still loads the app.
// 2) robots.txt + sitemap.xml, only when the site URL is known (SITE_URL, or Vercel/Netlify's own env vars).
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
const raw = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.URL || ''
const site = raw ? (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/$/, '') : ''
const base = (process.env.VITE_BASE || '/').replace(/\/$/, '')
if (site) {
  const slugs = JSON.parse(readFileSync('src/data/projects.json', 'utf8')).filter((p) => p.published).map((p) => p.slug)
  const urls = ['/', '/work', '/services', ...slugs.map((s) => `/work/${s}`)]
  writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site}${base}${u}</loc></url>`).join('')}</urlset>`)
  writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site}${base}/sitemap.xml\n`)
} else {
  writeFileSync('dist/robots.txt', 'User-agent: *\nAllow: /\n')
  console.log('SITE_URL not set: sitemap.xml skipped (robots.txt written without a Sitemap line).')
}
