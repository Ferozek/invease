# Invease

Free invoice generator for UK businesses. Built for K&R Accountants clients.

**Stack:** Next.js 16, React 19, Tailwind v4, Zustand, TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command               | What it does             |
| --------------------- | ------------------------ |
| `npm run dev`         | Start development server |
| `npm run build`       | Production build         |
| `npm start`           | Start production server  |
| `npm run lint`        | Run ESLint               |
| `npx playwright test` | Run E2E tests            |

## Documentation

- **[ROADMAP.md](ROADMAP.md)** — Complete product plan (phases, architecture, decisions, competitors, HMRC requirements)
- **[QA_CHECKLIST.md](QA_CHECKLIST.md)** — Pre-deploy verification commands
- **[DATA_BREACH_PROCEDURE.md](DATA_BREACH_PROCEDURE.md)** — Incident response procedure

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `main` triggers CI (GitHub Actions E2E tests) then auto-deploy.
