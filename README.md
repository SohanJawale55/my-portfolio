# Sohan Jawale: Portfolio (static)

React + TypeScript + Vite. No backend, no database, no admin. All content lives in `src/data/*.json` and images in `public/images/`. Free to host on Vercel, Netlify or GitHub Pages.

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the built dist/ locally
```
Node 18+ required.

## Where the content lives
| File | Content |
|---|---|
| `src/data/profile.json` | hero (headline, card, buttons), about (image, text, `resume_url`), contact (email, phone) |
| `src/data/skills.json` | About-section skill tags |
| `src/data/projects.json` | projects: slug, category, text, tech, cover, gallery images, links, `featured`, `published` |
| `src/data/experience.json` | work experience |
| `src/data/services.json` | the "Two disciplines" blocks on the home page |
| `src/data/freelance.json` | the Freelance Services page |
| `src/data/social-links.json` | social buttons (`icon`: github, linkedin, instagram, behance, x, youtube, dribbble, facebook, mail, link) |
| `src/data/settings.json` | footer options and the light/dark colour theme |

To update the site: edit a JSON file, commit, push. The host redeploys automatically.
Images go in `public/images/{profile,projects,services}/` and are referenced as `/images/projects/name.png`.
A project with `"published": false` is hidden, like it was in the admin.

## Things you still need to fill in
These were placeholders in your original database, so they are unchanged here:
- `profile.json` → `contact.email` (`your-email@example.com`) and `contact.phone` (`+91 00000 00000`)
- `social-links.json` → all four URLs (`.../your-username`)
- `profile.json` → `about.resume_url` is empty, so "Download resume" is disabled. Put the PDF at `public/resume/resume.pdf` and set `"resume_url": "/resume/resume.pdf"`.

## Contact
There is no form. The Connect section and the freelance "Enquire" buttons use `mailto:` / `tel:` links built from `contact.email` / `contact.phone`.

## Deploy
**Vercel (Hobby):** import the repo. Framework preset Vite, build `npm run build`, output `dist`. `vercel.json` already handles page refreshes on `/work/<slug>`.

**Netlify:** build `npm run build`, publish `dist`. `netlify.toml` includes the redirect rule.

**GitHub Pages:** project sites live under `/repo-name/`, so build with the base path:
```
VITE_BASE=/repo-name/ npm run build      # PowerShell: $env:VITE_BASE="/repo-name/"; npm run build
```
Publish `dist/` (for example with the `actions/deploy-pages` workflow). The build also writes `dist/404.html`, which lets direct links to project pages work. For a user site or custom domain, no `VITE_BASE` is needed.

**Optional sitemap:** set `SITE_URL=https://your-domain.com` in the build environment and `sitemap.xml` + `robots.txt` (with the Sitemap line) are generated. Without it only a plain `robots.txt` is written.

## External requests
The page loads Google Fonts and `three.js` (from jsDelivr) at runtime, exactly like the original. Three.js powers the About-section Lanyard card.
