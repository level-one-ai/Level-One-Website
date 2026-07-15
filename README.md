# Inner Circle — Level One

A single-page marketing site built with **React 19 + Vite + Tailwind CSS v4**, with
scroll animations (Motion) and smooth scrolling (Lenis).

This is a fully static site — it builds to plain HTML/CSS/JS and can be hosted
anywhere (GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any static host).

## Local development

Requires Node.js 20+.

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
```

## Build

```bash
npm run build     # outputs the static site to dist/
npm run preview   # preview the production build locally
```

## Deployment — GitHub Pages (automatic)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds the site and publishes it to GitHub Pages on every push to `main`.

**One-time setup after pushing the code:**

1. Go to your repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.

That's it. Every push to `main` will rebuild and redeploy automatically. The live
URL will be shown in **Settings → Pages** (typically
`https://<your-username>.github.io/<repo-name>/`).

## Deployment — Vercel / Netlify (alternative)

No configuration needed. Import the repo and use the defaults:

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Project structure

```
index.html                     # app shell + <head> meta / fonts
src/
  main.tsx                     # React entry point
  styles.css                   # Tailwind v4 + design tokens
  components/
    LandingPage.tsx            # the entire website
    ui/                        # shared UI components
  hooks/                       # React hooks
  lib/                         # utilities
public/
  favicon.ico
```

## SEO / GEO checklist (after your domain is live)

Three files contain a `YOUR-DOMAIN` placeholder to fill in (a 30-second edit):

1. `index.html` — uncomment the canonical `<link>` tag and set the domain.
2. `public/robots.txt` — uncomment the `Sitemap:` line and set the domain.
3. `public/sitemap.xml` — replace `YOUR-DOMAIN` in the `<loc>` URL.

Then submit the sitemap in Google Search Console. The site already ships
`llms.txt`, JSON-LD structured data (Organization, Services, FAQ), and
explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
in robots.txt.
