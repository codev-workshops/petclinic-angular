# Cutover runbook — React replaces Angular under `/petclinic/`

Status: Phase 3 (integration & parity). Angular is **retained** in this phase; it is removed in
Wave 4 only after the React image has been live and stable.

## 1. Production serving decision

The production image (`Dockerfile`) is nginx `1.17.6` on port **8080** serving `dist/` (the Vite
build, `base: '/petclinic/'`) from `/usr/share/nginx/html/petclinic/`.

**Decision: SPA `try_files` fallback (keep `nginx/default.conf`), not the stock nginx 404.**

| Option | Behaviour | Verdict |
|---|---|---|
| Stock nginx (no fallback) | `/petclinic/` works; any deep link (`/petclinic/owners`, `/petclinic/vets/1/edit`) or browser refresh returns nginx's 404 page | Rejected — the Angular app was always served through the README's nginx snippet with a fallback; React Router (`basename: '/petclinic'`) needs the same |
| `try_files $uri $uri/ /petclinic/index.html` | Deep links and refreshes render the app; unknown routes render the in-app "Oops! Page not found !" page (HTTP 200, same as Angular's wildcard route) | **Chosen** |

`nginx/default.conf`:

```nginx
location /petclinic/ { try_files $uri $uri/ /petclinic/index.html; }
location /petclinic/assets/ { try_files $uri =404; add_header Cache-Control "public, max-age=31536000, immutable"; }
location = / { return 302 /petclinic/; }
```

The `assets/` block was added in Phase 3 so a missing hashed bundle is a real 404 instead of
`index.html` (which would otherwise be served with a `text/html` MIME type to a `<script>` tag).

### Verification (Phase 3, local Docker)

```
$ docker build -t petclinic-react . && docker run -d -p 8080:8080 petclinic-react
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/                          -> 302  (Location: /petclinic/)
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/petclinic/                -> 200
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/petclinic/owners          -> 200  (deep link → index.html)
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/petclinic/vets/1/edit     -> 200
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/petclinic/assets/missing.js -> 404
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/nothing                   -> 404  (outside /petclinic/)
$ curl -s http://localhost:8080/petclinic/owners | grep -o '<script[^>]*>\|<link[^>]*stylesheet[^>]*>'
<script type="module" crossorigin src="/petclinic/assets/index-<hash>.js">
<link rel="stylesheet" crossorigin href="/petclinic/assets/index-<hash>.css">
$ curl -sI http://localhost:8080/petclinic/assets/index-<hash>.js  -> 200, application/javascript
$ curl -sI http://localhost:8080/petclinic/assets/index-<hash>.css -> 200, text/css
```

The React app calls the backend at `http://localhost:9966/petclinic/api/` (same as Angular, see
`src/services/api.ts`); no nginx proxying is involved, exactly as before the migration.

## 2. Pre-cutover: build and retain the Angular rollback image

Do this **before** merging, from a clean worktree of `origin/main` (still Angular there):

```bash
git fetch origin
git worktree add ../petclinic-angular-main origin/main
(
  cd ../petclinic-angular-main
  # main's Dockerfile builds the Angular app (ng build --base-href /petclinic/ --deploy-url /petclinic/)
  docker build -t petclinic-angular:rollback -t "petclinic-angular:$(git rev-parse --short HEAD)" .
)
git worktree remove ../petclinic-angular-main
docker push petclinic-angular:rollback   # or: docker save petclinic-angular:rollback | gzip > petclinic-angular-rollback.tgz
```

Smoke-test it once: `docker run --rm -p 8081:8080 petclinic-angular:rollback` →
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/petclinic/` is `200`.

## 3. Cutover

```bash
# 1. Merge the integration branch into main (squash keeps main's history linear).
git checkout main && git pull --ff-only
git merge --squash origin/react-migration
git commit -m "React cutover: replace Angular app with React 19 (react-migration)"
git tag -a react-cutover-$(date +%Y%m%d) -m "React cutover"
git push origin main --tags

# 2. Build + tag the React image from main.
git rev-parse --short HEAD          # -> <sha>
docker build -t petclinic-react:<sha> -t petclinic-react:latest .
docker push petclinic-react:<sha> && docker push petclinic-react:latest

# 3. Flip nginx: replace the running frontend container on 8080.
docker rm -f petclinic-frontend
docker run -d --name petclinic-frontend --restart unless-stopped -p 8080:8080 petclinic-react:<sha>

# 4. Post-flip smoke test (same checks as section 1).
for p in /petclinic/ /petclinic/owners /petclinic/vets/1/edit; do
  curl -s -o /dev/null -w "$p %{http_code}\n" http://localhost:8080$p
done
TARGET=react REACT_BASE_URL=http://localhost:8080/petclinic/ npm run test:e2e   # parity suite against prod image
```

If a reverse proxy fronts several containers instead of exposing 8080 directly, "flip" means
pointing its `upstream` for `/petclinic/` at the new container and `nginx -s reload`; the
container-level commands above are otherwise unchanged.

## 4. Rollback (one command)

```bash
docker rm -f petclinic-frontend && docker run -d --name petclinic-frontend --restart unless-stopped -p 8080:8080 petclinic-angular:rollback
```

Nothing else changes: the backend, its data, and the URL space (`/petclinic/**`) are identical
for both apps, so rolling back is purely a frontend image swap. Re-run the smoke test
(`TARGET=angular ANGULAR_BASE_URL=http://localhost:8080/petclinic/ npm run test:e2e`).

`main` is *not* reverted on rollback; fix forward on `react-migration` and cut over again.

## 5. Wave 4 — Angular decommission checklist (do NOT execute in Phase 3)

Only after the React image has served production traffic without a rollback:

- [ ] Delete `src/app/**`, `src/main.ts`, `src/polyfills.ts`, `src/test.ts`, `src/index.html`
      (Angular entry; the React entry is `index.html` at the repo root + `src/main.tsx`),
      `src/environments/**` if unused by React, `src/styles.css`/Angular-only assets.
- [ ] Delete `angular.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `karma.conf.js`,
      `protractor.conf.js`, `e2e-protractor/**`, `.browserslistrc` (if Angular-only).
- [ ] `package.json`: remove the `ng`, `ng:start`, `ng:build`, `ng:test`, `ng:test-headless`,
      `ng:lint`, `ng:e2e` scripts and the Angular dependencies (`@angular/*`,
      `@angular-devkit/*`, `@angular-eslint/*`, `@angular/material` + `@angular/cdk`,
      `@angular/material-moment-adapter`, `moment` if unused, `rxjs` if unused, `zone.js`,
      `karma*`, `jasmine*`, `protractor`, `ts-node` (if only used by Protractor),
      `codelyzer`, `tslint`). Run `npm ci && npm run lint && npm run typecheck && npm run test -- --run && npm run build`.
- [ ] `tsconfig.json`: drop Angular compiler options; fold `tsconfig.react.json` into it.
- [ ] `eslint.config.mjs`: remove the `e2e-protractor/**` ignore and Angular overrides.
- [ ] `playwright.config.ts`: remove the `angular` project and `TARGET=angular|both`;
      delete `npm run test:e2e:angular` / `test:e2e:both`, `e2e/__screenshots__/angular`,
      the Angular branches in `e2e/fixtures.ts` (MatSelect / MatDatepicker helpers).
- [ ] `README.md`: remove the Angular column/sections; `AGENTS.md`: drop "migration" wording.
- [ ] `Dockerfile`: no change needed (already builds React); delete `petclinic-angular:rollback`
      from the registry after the retention window.
- [ ] Remove `docs/migration/**` or move to `docs/history/`.
