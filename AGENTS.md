# AGENTS.md — petclinic-angular

## Repository Purpose

Angular 16 frontend for the Spring PetClinic ecosystem. Manages pet owners, veterinary staff, and appointment records. Backend API base URL: `http://localhost:9966/petclinic/api/`.

## React Migration Standards

When migrating this Angular app to React, follow these patterns to produce clean, review-ready code on the first pass.

### Error Handling

- Every `fetch`, `axios`, or promise-based API call MUST have a `.catch()` handler — including nested calls inside `.then()` chains
- Use `try/catch` in `async` functions inside `useEffect`
- Display user-visible error messages in a dismissable alert component
- Clear stale error and success messages when navigating away (`useEffect` cleanup) or when retrying a request
- On delete/mutation success callbacks that re-fetch data, the re-fetch call also needs its own `.catch()`

### Loading States

- Track loading state with a boolean (e.g., `isLoading`) initialized to `true`
- Gate "empty state" messages (e.g., "No owners found") behind a `!isLoading` check — never show empty-state copy while the initial request is in flight
- Show a loading indicator (spinner or text) until the first successful or failed response

### Navigation

- Use `react-router-dom` v6 with `useNavigate()` for programmatic navigation
- Back buttons: use `navigate(-1)` with a fallback to a known route in case there is no browser history
- Every add/create/edit route MUST work when accessed directly via URL (not only from a parent page) — pre-fetch any required data (e.g., owner details, pet types) on mount
- Use `useParams()` for route parameters; validate that required params exist before fetching

### Forms and Validation

- Use controlled components with `useState` for form fields
- Validate required fields on submit; show inline validation messages
- Disable the submit button while a request is in flight to prevent double-submission
- After successful create/update, navigate to the detail view of the created/updated resource

### Accessibility

- All `<input>` and `<select>` elements must have an associated `<label>` or `aria-label`
- Use `aria-describedby` to associate error messages with their form fields
- Buttons must have descriptive text content (not just icons)

### Component Structure

- One component per file; file name matches component name in PascalCase
- Colocate styles with components (CSS modules or styled-components)
- Keep API client calls in a shared service file (e.g., `src/services/api.ts`), not inline in components
- Export a single API client instance; do not create new axios/fetch instances per component

### Testing (RTL + MSW)

- MSW handlers should mock the documented API contract endpoints with realistic response shapes
- Test user-visible behavior, not implementation details
- Each test should be independent — no shared mutable state between tests
- Mock the base URL consistently: `http://localhost:9966/petclinic/api`
- Handle both success and error responses (including 404 and network errors) in MSW handlers
- Use `204 No Content` (empty body) for DELETE endpoint mocks, not `200` with a body
