# Phase 4 — Idiomatic refactor

Branch `migration/phase-4-idiomatic` (PR "Phase 4: Idiomatic refactor"), based on `main` @ `6ad6ff3`
(`react-cutover-20260903`). Every step below is one commit; the Playwright parity suite
(`e2e/`) and `npm run lint && npm run typecheck && npm run test -- --run && npm run build`
were green after each one.

## Step 1 — Baseline

Backend: `springcommunity/spring-petclinic-rest` on `:9966`. Angular `npm run ng:start`
(serves at `http://localhost:4200/` — the dev server has no `/petclinic` base href, so
`ANGULAR_BASE_URL=http://localhost:4200/` was passed) and React `npm run dev`
(`http://localhost:5173/petclinic/`).

```
ANGULAR_BASE_URL=http://localhost:4200/ REACT_BASE_URL=http://localhost:5173/petclinic/ npm run test:e2e:both
44 passed (41.2s)      # 22 angular + 22 react
```

Dependency count before: `package.json` 25 `dependencies` + 49 `devDependencies` = 74 direct.

## Per-step parity log

| Step | Commit | e2e | lint / typecheck / vitest / build |
| ---- | ------ | --- | --------------------------------- |
| 1 Baseline | — | 44/44 (angular + react) | green |
