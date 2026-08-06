# Playwright parity gate

This suite uses only framework-neutral DOM contracts: ids, names, Bootstrap classes,
headings, links, buttons, and visible text. It does not inspect Angular or Material
implementation details.

Each test receives a fresh in-memory store. The route adapter intercepts requests to
`http://localhost:9966/petclinic/api/**`, handles CORS and preflight requests, and
records method, URL, and JSON body for assertions. No second HTTP adapter is needed:
Playwright surfaces the browser requests (including JSON writes) to `page.route`.

The seed contains owners John Doe and Jane Smith; pets Leo, Rex, and Milo; cat, dog,
and lizard pet types; radiology, surgery, and dentistry specialties; two vets; and
two visits. CRUD operations mutate only the test's store.

The contract includes route paths, headings, table ids, form control ids/names,
Bootstrap validation classes/messages, request paths and JSON payloads, and the
application's error-header behavior. Date inputs are typed text-only and submitted
as ISO `YYYY-MM-DD` values.

## Observed legacy deviations from the original coverage brief

- A successful owner add navigates to `/owners`, not the new owner's detail route.
- Pet list (`/pets`) renders the pet-list shell with empty pet inputs because the
  routed component has no input; the gate asserts that the route renders.
- Pet edit's `< Back` button throws because the untouched component calls
  `gotoOwnerDetail` with an undefined owner; no extra back-navigation assertion is
  included beyond the required edit/update flow.
- The date adapter accepts typed `YYYY-MM-DD`, renders it as `YYYY/MM/DD`, and
  rejects `M/D/YYYY` and `MM/DD/YYYY` in these controls.
- Native `maxlength="80"` truncates overly long pet-type/specialty names before
  Angular can display the maxlength help message; the gate asserts the maxlength
  contract and required/pattern validation instead.
- The list tables render names through readonly form-control values rather than
  table text nodes; the gate reads those values.
- When `GET owners` fails with HTTP 500, the legacy Owners page remains mounted:
  it keeps the `Owners` heading and search form and renders the empty-state
  message for an empty search. The Pet Types list likewise remains mounted with
  its heading, table shell, and Add control when `GET pettypes` fails.
