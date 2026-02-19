# AGENTS.md

## Project Summary
- **Name:** `1px-li-frontend`
- **Stack:** Vue 3 + TypeScript + Vite
- **UI:** Bootstrap 5 + BootstrapVueNext + lucide-vue-next icons
- **State:** Pinia stores (`auth`, `urls`)
- **Routing:** Vue Router with auth guard
- **HTTP:** Axios
- **API base:** `https://onepixel.link/api/v1` (`src/constants.ts`)

This app is a frontend for creating and managing shortened URLs on 1px.li.

---

## Walkthrough TODO (kept during project review)
- [x] Inspect root-level config and package scripts
- [x] Inspect app bootstrap (`src/main.ts`) and root component (`src/App.vue`)
- [x] Inspect router and navigation guards (`src/router/index.ts`)
- [x] Inspect auth and URL Pinia stores (`src/stores/*.ts`)
- [x] Inspect view components (`src/views/*.vue`)
- [x] Inspect reusable components (`src/components/*.vue`)
- [x] Inspect shared API types (`src/types/api.ts`)
- [x] Inspect static styles and HTML shell (`src/style.css`, `index.html`)
- [x] Review build/test/lint availability from `package.json`
- [x] Map frontend API usage and link canonical Swagger

---

## Repository Layout
- `src/main.ts` — Vue app bootstrap: registers Pinia, Router, BootstrapVueNext.
- `src/App.vue` — root wrapper containing only `<router-view>`.
- `src/constants.ts` — API base URL constant.
- `src/router/index.ts` — routes + `beforeEach` auth guard.
- `src/stores/auth.ts` — login/logout + token persistence in `localStorage`.
- `src/stores/urls.ts` — URL CRUD/read operations against backend.
- `src/views/Login.vue` — login form and redirect to dashboard on success.
- `src/views/Dashboard.vue` — URL creation form, list loading, logout.
- `src/components/URLList.vue` — table of URLs + copy + details modal.
- `src/types/api.ts` — TypeScript interfaces for API payloads.
- `src/style.css` — Vite starter styles (many rules are currently unused by app UI).
- `vite.config.ts`, `tsconfig*.json` — Vite + strict TypeScript config.
- `dist/` — production build output (contains SPA redirect file for deployment).

---

## Runtime Flow
1. App bootstraps in `main.ts`.
2. Router guard checks `authStore.isAuthenticated` for protected routes.
3. User logs in at `/login`; token is saved to `localStorage`.
4. Dashboard fetches URLs on mount and allows creating random/custom short URLs.
5. URL list supports:
   - Copy short URL to clipboard
   - Opening modal with hit count via URL info lookup
6. Logout clears token/user and routes to login.

---

## Route Map
- `/` → redirect to `/dashboard`
- `/login` → public login page
- `/dashboard` → protected page (`meta.requiresAuth: true`)

Guard behavior (`src/router/index.ts`):
- Unauthenticated user accessing protected route is redirected to `/login`.
- Authenticated user accessing `/login` is redirected to `/dashboard`.

---

## State Management
### `useAuthStore` (`src/stores/auth.ts`)
- State:
  - `user: UserResponse | null`
  - `token: string | null` (initialized from `localStorage`)
- Getter:
  - `isAuthenticated`
- Actions:
  - `login(credentials)` → `POST /users/login`
  - `logout()` → clear state + remove token from `localStorage`

### `useUrlStore` (`src/stores/urls.ts`)
- State:
  - `urls: UrlResponse[]`
- Actions:
  - `fetchUrls()` → `GET /urls` (auth header)
  - `createRandomUrl(data)` → `POST /urls` (auth header)
  - `createSpecificUrl(shortcode, data)` → `PUT /urls/{shortcode}` (auth header)
  - `getUrlInfo(shortcode)` → `GET /urls/{shortcode}`

---

## API Contract Notes
- **Canonical backend API documentation (Swagger/OpenAPI):**  
  `https://onepixel.link/docs/doc.json`

- **Endpoints currently consumed by this frontend:**
  - `POST /users/login`
  - `GET /urls`
  - `POST /urls`
  - `PUT /urls/{shortcode}`
  - `GET /urls/{shortcode}`

- **Auth mechanism:**
  - Bearer token expected in `Authorization` header for protected URL endpoints.

- **Frontend response/error typing:**
  - `src/types/api.ts` defines current request/response shapes and `ErrorResponse`.

When adding features, use the Swagger doc above as source of truth and keep `src/types/api.ts` aligned.

---

## Build, Run, and Validation
From repository root:
- `npm ci` — install dependencies.
- `npm run dev` — start Vite dev server.
- `npm run build` — type-check (`vue-tsc`) + production build.
- `npm run preview` — preview built app.

Current `package.json` does **not** define dedicated lint/test scripts.

---

## Conventions for Future Coding Agents
- Prefer minimal, surgical edits.
- Keep logic in stores; keep view components mostly orchestration/UI.
- Reuse and extend interfaces in `src/types/api.ts` instead of using `any`.
- Preserve auth guard behavior when modifying routing.
- Keep `API_BASE_URL` centralized in `src/constants.ts`.
- Follow existing error handling pattern (`err.response?.data?.message` fallback).
- Use Bootstrap utility/component classes for UI changes.
- If API shape changes, update store calls + type definitions together.

---

## Known Gaps / Refactor Opportunities (non-blocking)
- `src/style.css` still contains much of Vite starter defaults and may conflict with Bootstrap-centric layout.
- `Dashboard.vue` has `urls` typed as `any[]`; this can be tightened to `UrlResponse[]`.
- No automated tests currently exist.
