# Bektas Immobilien Wiesbaden — Premium Demo

Two production-ready, German-language experiences in one static Vite application:

- `/` — editorial premium real-estate website with listings, valuation funnel, services, team, FAQ and contact flows.
- `/experience` — lazy-loaded scroll-driven WebGL architectural journey with responsive quality settings and a reduced-motion/non-WebGL fallback.

## Local development

```bash
npm ci
npm run dev
```

## Cloudflare Pages

- Production branch: `main`
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js: 22

`public/_redirects` provides SPA fallback so `/experience` works when opened directly.

## Performance approach

The conventional website never imports WebGL. The 3D route and its Three.js scene are split into separate lazy chunks. The scene uses procedural geometry, local assets, bounded DPR, fewer city meshes on mobile, disabled mobile shadows, no runtime HDRI/model fetches, and reduced-motion/static fallbacks.

See [ASSET-LICENSES.md](./ASSET-LICENSES.md) for image, font and library sources.
