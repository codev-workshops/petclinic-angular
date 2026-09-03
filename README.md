# Spring Petclinic (React frontend)

[![React CI](https://github.com/codev-workshops/petclinic-angular/actions/workflows/react-ci.yml/badge.svg)](https://github.com/codev-workshops/petclinic-angular/actions/workflows/react-ci.yml)

React 19 + Vite frontend for Spring Petclinic. This repository started life as
`spring-petclinic-angular`; the Angular 16 app was migrated to React and decommissioned
(history: `docs/migration/*`, tag `react-cutover-20260903`).

Warning: **client only**.
  Use REST API from backend [spring-petclinic-rest project](https://github.com/spring-petclinic/spring-petclinic-rest)
  You need start backend server before start frontend application.

## Stack

| | |
|---|---|
| Entry | `index.html`, `src/main.tsx`, `src/App.tsx`, `src/router.tsx` |
| Source | `src/{components,features,forms,models,services,styles,mocks,utils,test}/**` |
| Tooling | Vite, TypeScript (`tsconfig.json`), ESLint flat config (`eslint.config.mjs`), Vitest + Testing Library + MSW (`vitest.config.ts`), Playwright (`playwright.config.ts`, `e2e/`) |
| Styling | CSS Modules + design tokens (`src/styles/tokens.css`, `src/styles/global.css`), icons from `lucide-react` |
| Forms | Shared Zod schemas in `src/forms/schemas.ts` |
| Imports | `@/` alias for cross-folder imports (enforced by ESLint) |

The app expects the [spring-petclinic-rest](https://github.com/spring-petclinic/spring-petclinic-rest)
backend at `http://localhost:9966/petclinic/api/` and is served under `/petclinic/`:

```
docker run -d --name petclinic-rest -p 9966:9966 springcommunity/spring-petclinic-rest
```

## Scripts

Node `>= 22.12` (`nvm use 22`), then `npm ci`.

| Script | Purpose |
|---|---|
| `dev` | Vite dev server at `http://localhost:5173/petclinic/` |
| `build` | Production build to `dist/` (used by the `Dockerfile`, served by nginx on 8080) |
| `preview` | Serve the production build locally |
| `lint` | ESLint |
| `typecheck` | `tsc -p tsconfig.json --noEmit` |
| `test` | Vitest (`npm run test -- --run` for a single pass) |
| `test:e2e` | Playwright parity suite (`e2e/journeys`); needs the backend on 9966. Set `REACT_BASE_URL` to test an already running server |
| `test:e2e:visual-diff` | pixelmatch report of `e2e/__screenshots__/react` against the historical `angular/` screenshots |

CI lives in `.github/workflows/react-ci.yml`.

## Docker

```
docker build -t spring-petclinic-react:latest .
docker run --rm -p 8080:8080 spring-petclinic-react:latest
# -> http://localhost:8080/petclinic/
```

The image builds `dist/` with `npm run build` and serves it with nginx (`nginx/default.conf`)
under `/petclinic/` on port 8080 (SPA fallback to `index.html`).

## Deploy on a web server

Build with `npm run build`; `dist/` is emitted for the `/petclinic/` base path. Copy it to
`<web root>/petclinic/` and add an SPA fallback so every path under `/petclinic/` serves
`index.html`.

### Nginx

```
server {
	listen       80 default_server;
        root         /usr/share/nginx/html;
        index index.html;

	location /petclinic/ {
                alias /usr/share/nginx/html/petclinic/;
                try_files $uri$args $uri$args/ /petclinic/index.html;
        }
}
```

### Apache

Set `AllowOverride All` for the document root and add `/var/www/html/petclinic/.htaccess`:

```
RewriteEngine On
# If an existing asset or directory is requested go to it as it is
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]

# If the requested resource doesn't exist, use index.html
RewriteRule ^ index.html
```

Run the app in the browser: http://server_name/petclinic/
