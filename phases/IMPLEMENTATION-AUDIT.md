# Full Phase-by-Phase Implementation Audit

**Repository:** `akshatjshah2005/tem`  
**Audited branch base:** `main`  
**Audit type:** Static source and repository review  
**Audit date:** 2026-10-21  
**Important limitation:** This report checks the files and implementation patterns visible in the repository. It does **not** claim that the app was installed, built, connected to PostgreSQL/Redis, or exercised in a live browser during this audit. Anything that needs runtime proof is marked **UNVERIFIED**. Re-run the build and end-to-end checks after the findings below are addressed.

## Status definitions

- **PRESENT** — relevant code/configuration is present; not necessarily fully verified.
- **PARTIAL** — a basic implementation exists, but one or more documented requirements are missing.
- **MISSING** — no implementation was found in the reviewed repository paths.
- **UNVERIFIED** — code exists but runtime behavior, security, performance, or deployment was not demonstrated.
- **FUTURE** — explicitly post-MVP or later roadmap work; do not treat it as a launch blocker unless promoted into MVP scope.

## Executive summary

The repository is a meaningful starter implementation: it contains a Next.js web app, Express API, Prisma schema, authentication, invitation/event/guest/media/template APIs, three wedding template definitions, a template renderer, public and personalized invitation routes, WhatsApp message editing, RSVP submission/stats endpoints, and a small build workflow.

It is **not yet evidence that all 13 phases are complete**. The master TODO still marks every phase pending. The strongest gaps visible from source review are:

1. The planned 10–12 launch templates are not present; the repository tree contains only three template definition folders.
2. The current invitation editor is a tabbed form editor, not the planned three-panel visual/drag-and-drop editor; undo/redo, responsive canvas modes, conflict handling, and offline editing were not found.
3. Analytics collection/dashboard, QR generation/download/print sheets, and guest-group CRUD are not implemented as complete features in the reviewed code. A guest `groupName` field is not the same as group management.
4. Bulk WhatsApp is explicitly left as a TODO in the guest screen; automated WhatsApp Business API delivery is not implemented.
5. Admin UI/API covers some core operations, but documented category CRUD, full template lifecycle/versioning, audit log, and several admin actions are not complete.
6. Test automation is incomplete: CI runs dependency install, Prisma generation, and API/web builds, but does not run a comprehensive unit/integration/E2E/security/performance suite. The existing E2E script targets Phase 03 and still needs to be executed against a configured environment.
7. Production readiness items—refresh-token rotation/revocation, lockout policy, upload hardening/storage, expiry behavior, security review, backups, monitoring, and deployment verification—remain unverified or incomplete.

**Conclusion:** Do not mark the platform “all features complete” or launch-ready based on file presence alone.

## Phase 01 — Infrastructure & Database

**Overall status: PARTIAL / UNVERIFIED**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Monorepo with web and API | PRESENT | `digital-invitations/apps/web`, `apps/api`, `packages/database`, `packages/shared` are represented in project structure; confirm every workspace exists and is wired correctly. |
| TypeScript configuration | PRESENT | Web/API TypeScript configs are in the tree. |
| Environment example | PRESENT | `apps/api/.env.example`. Production secrets and environment validation still need review. |
| Docker Compose | UNVERIFIED | README documents `docker-compose up -d`; the expected `digital-invitations/docker-compose.yml` was not found at that path in the reviewed tree. Verify the actual compose-file location. |
| GitHub Actions | PRESENT / PARTIAL | `.github/workflows/build.yml` installs dependencies, generates Prisma client, and builds API/web. It does not run tests or deployment. |
| ESLint + Prettier | PARTIAL | API lint script exists; no confirmed consistent root lint/format configuration across workspaces. |
| Prisma schema | PRESENT | `packages/database/prisma/schema.prisma` includes core entities plus RSVP/analytics-related models. |
| Migration history | MISSING / UNVERIFIED | README offers schema push/migrate commands, but a checked-in migration history was not established from the tree. Production migrations should be committed and tested. |
| Seed data | PRESENT, DEVELOPMENT RISK | `seed.ts` seeds admin/customer demo accounts with hard-coded demo passwords. Ensure these are development-only and never usable in production. |
| API health/error handling | PRESENT | API entry point includes health response and error handler. Verify error responses and logs do not leak sensitive data. |
| S3/R2/CDN storage | PARTIAL | Uploads are written to a local `uploads` directory and served statically. Production object storage, signed URLs, CDN, and lifecycle rules are not established. |
| Branch protection | UNVERIFIED | Cannot confirm from source files; inspect GitHub repository settings. |

**Required follow-up:** confirm Docker file location, add and test Prisma migrations, enforce environment validation, separate development seeds from production, and choose production media storage before deployment.

## Phase 02 — Authentication & Customer Dashboard

**Overall status: PARTIAL / UNVERIFIED**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Registration/login | PRESENT | `auth.controller.ts`, `auth.routes.ts`, login/register pages. |
| Password hashing | PRESENT | bcryptjs with 12 rounds appears in auth and seed code. |
| Server-side validation | PRESENT / PARTIAL | Zod schemas exist; verify all edge cases and uniqueness constraints. |
| JWT access token | PRESENT | JWT is generated with configurable expiry (default 7 days). |
| Refresh-token rotation/revocation/logout | MISSING / PARTIAL | No complete refresh-token rotation/revocation flow was found in reviewed auth routes. |
| Failed-login lockout | UNVERIFIED / likely missing | Documented lockout after five failed attempts was not established in the reviewed auth controller. |
| Auth-specific rate limits | PARTIAL | Global rate limiting exists; exact registration/login limits from the phase plan were not verified. |
| Role-based authorization | PRESENT | Admin routes use authentication and ADMIN role middleware. |
| Dashboard and invitation list | PRESENT / PARTIAL | Dashboard page and invitation APIs exist. Verify search, pagination, empty/loading/error states and every card action. |
| Duplicate/delete/publish flows | PARTIAL | Duplicate, delete, publish/unpublish API actions exist; runtime and ownership checks need tests. |
| Create wizard | PARTIAL | Create route exists; confirm the complete three-step category/template/confirmation flow and its validation. |
| Reusable UI component library | PARTIAL | Components exist, but no complete design-system coverage for every component listed in Phase 02 was verified. |
| Responsive layout | UNVERIFIED | Responsive classes are present in pages; actual device/browser testing is still required. |

**Required follow-up:** add refresh-token/session lifecycle, lockout and auth rate-limit tests; verify user ownership on every customer endpoint; test all dashboard/create flows on mobile and desktop.

## Phase 03 — Template Engine

**Overall status: PARTIAL**

| Requirement | Status | Evidence / notes |
|---|---|---|
| JSON template definitions | PRESENT | `templates/wedding-classic-gold/config.json`, `wedding-floral-romance/config.json`, `wedding-modern-minimal/config.json`. |
| Template database sync/seeding | PRESENT | `templateDefinitions.ts`, `syncTemplates.ts`, `seed.ts`. |
| Template renderer / registry | PRESENT | `TemplateRenderer.tsx`, `registry.tsx`, render model/types/variables helpers. |
| Animated sections | PARTIAL | Reveal/countdown and wedding section components exist. Full animation catalog, scroll behavior, reduced-motion compliance, and 60fps performance are not verified. |
| Guest-personalized rendering | PRESENT / UNVERIFIED | Personalized public route and server renderer exist; event filtering and privacy behavior need end-to-end tests. |
| Desktop/tablet/mobile preview | PARTIAL / UNVERIFIED | Preview route exists; explicit three-device preview modes and their behavior were not confirmed. |
| Initial 10–12 templates | MISSING | Only three template definition folders were found. |
| All section types (map, social links, custom section, etc.) | PARTIAL | Hero, events, gallery, RSVP, countdown-related components exist; complete configurable section coverage was not established. |
| Template admin CRUD | PARTIAL | Template controller and admin template page exist; versioning, duplicate/archive lifecycle and full feature/field configuration require verification. |
| Performance/accessibility requirements | UNVERIFIED | No benchmark, Lighthouse report, or accessibility test evidence was found. |

**Required follow-up:** finish at least the agreed launch template set, test every template's variables and sections, add preview breakpoints, honor reduced-motion preferences, and add accessibility/performance checks.

## Phase 04 — Invitation Editor

**Overall status: PARTIAL; visual-editor requirements are largely missing**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Invitation content editing | PRESENT | `dashboard/invitations/[id]/page.tsx` has details/content/events/media/WhatsApp/settings tabs. |
| Event CRUD from editor | PRESENT / UNVERIFIED | Event form and event API integration exist. |
| Media upload integration | PRESENT / UNVERIFIED | Media uploader and media API integration exist. |
| Three-panel editor (sections/canvas/properties) | MISSING | The reviewed editor is a tabbed form workflow, not the documented three-panel visual editor. |
| Drag/drop section ordering | MISSING / not found | No editor drag-and-drop implementation was identified. |
| Element selection on canvas / style controls | MISSING / PARTIAL | Editable fields exist; a true selectable canvas/property inspector was not found. |
| Undo/redo stack and keyboard shortcuts | MISSING | No undo/redo implementation was found. |
| Debounced autosave / save state | PARTIAL / UNVERIFIED | Save actions exist; continuous debounced autosave and conflict resolution were not established. |
| Offline edit and sync | MISSING | No offline queue/sync implementation was found. |
| Desktop/tablet/mobile canvas toggles | MISSING / PARTIAL | Preview page exists, but documented canvas device toggles were not established. |
| Validation and full-screen preview | PARTIAL | Form/API validation and preview route exist; complete editor validation and full-screen modes need testing. |
| Mobile-specific editor interactions | UNVERIFIED | Must be checked on real viewport sizes. |

**Required follow-up:** decide whether the MVP is a practical form-based editor or the planned Canva-like editor. If Canva-like is required, treat canvas selection, property inspector, reorder, undo/redo, autosave, and responsive preview as a separate major workstream—not completed.

## Phase 05 — Events & Media

**Overall status: PARTIAL**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Event add/edit/delete | PRESENT / UNVERIFIED | Event controller/routes and `EventForm.tsx` exist. |
| Event reordering | PRESENT / UNVERIFIED | Reorder endpoint exists; UI behavior and ordering persistence need tests. |
| Duplicate event | MISSING / not found | No duplicate-event action was identified. |
| Event date/time validation | PARTIAL | Time parsing and Zod validation exist; timezone/future-date and end-after-start edge cases need tests. |
| Image upload and optimization | PRESENT / PARTIAL | Multer, Sharp, original/optimized/thumb file handling exist. |
| File type/size/security validation | UNVERIFIED | Must inspect actual multer limits and content sniffing; extension/MIME alone is not sufficient. |
| Drag/drop, progress, cancel, retry | PARTIAL | Uploader component exists; all listed upload UX behaviors were not confirmed. |
| Gallery ordering, cover, delete | PRESENT / UNVERIFIED | API functions/routes exist; verify UI and filesystem cleanup. |
| WebP and responsive sizes | PARTIAL | Optimized/thumb variants are generated; exact 800/1200/1920 variants and WebP fallback pipeline were not established. |
| EXIF stripping | UNVERIFIED | Sharp pipeline exists; verify metadata is stripped from delivered images. |
| S3/R2/CDN/signed URLs | MISSING for production setup | Local upload storage is used in the reviewed controller. |
| Map search/pin/lat-lng picker | MISSING / not found | No map-picker integration was identified. |
| Lightbox/slideshow/captions/video | PARTIAL / missing | Basic gallery exists; full Phase 13 gallery features are not established. |

**Required follow-up:** harden upload validation, test image processing and cleanup, add map selection and production storage, and verify gallery ordering/cover state end to end.

## Phase 06 — Guest Management

**Overall status: PARTIAL**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Guest CRUD | PRESENT / UNVERIFIED | Guest controller/routes, form, and management page exist. |
| Unique personal tokens | PRESENT | Uses Node crypto random bytes and checks uniqueness. |
| Event assignment | PRESENT / UNVERIFIED | Guest-event junction logic and assignment route exist. |
| Excel import | PRESENT / PARTIAL | XLSX parser and import UI exist; detailed preview/validation, batching, partial failures, and progress UX need verification. |
| Duplicate mobile and invalid-row handling | PARTIAL / UNVERIFIED | Some duplicate checks exist; run malformed/duplicate workbook tests. |
| Search/filter | PARTIAL | Search and group filter UI exist; server supports pagination/search/status/group. Fuzzy search, full sorting, and all filters were not established. |
| Guest pagination | PARTIAL / UNVERIFIED | API accepts page/limit; UI pagination controls and boundary behavior need verification. |
| Copy personalized link / regenerate | PRESENT / UNVERIFIED | API link/token generation and regeneration exist; confirm copy action and old-token invalidation. |
| Bulk delete / bulk assign | PARTIAL / missing | Individual delete and assignment exist; complete bulk actions were not found. |
| Export guests to Excel | MISSING / not found | No export endpoint/action was identified. |
| Group CRUD | MISSING | Guest `groupName` supports labels but does not provide a group-management entity/API. |
| Bulk WhatsApp from guest list | PARTIAL | UI handler explicitly contains a TODO to open the bulk WhatsApp modal. |

**Required follow-up:** add import preview/validation tests, export, complete bulk actions, robust pagination, and actual group management if required for launch.

## Phase 07 — Personalization Engine

**Overall status: PARTIAL / UNVERIFIED**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Random URL-safe token | PRESENT | Uses crypto random bytes with URL-safe encoding and collision check. |
| Guest-specific URL generation | PRESENT | Link stored with invitation slug and personal token. |
| Common and personalized public routes | PRESENT | Public route handlers and Next.js routes exist. |
| Guest name substitution | PRESENT / UNVERIFIED | Template variable resolution and personalized renderer exist. |
| Assigned-event filtering | PRESENT / UNVERIFIED | Personalized API includes guest event assignments; verify guests see only assigned events. |
| No-events fallback | UNVERIFIED | Must test guest with no event assignments. |
| Old token invalidation on regeneration | PRESENT / UNVERIFIED | Token update exists; verify old URL fails immediately. |
| Only published invitations accessible | UNVERIFIED | Publishing/public access code exists; test unpublished and archived states. |
| Expired invitations return 410 | UNVERIFIED / not established | Expiry field may exist, but explicit 410 behavior was not confirmed. |
| Noindex on personalized pages | UNVERIFIED | Must confirm metadata headers for both public and personalized routes. |
| Token redaction and rate limiting | UNVERIFIED | Ensure tokens are not logged and token-validation abuse is rate-limited. |
| Analytics tracking | PARTIAL / missing | Analytics model exists, but end-to-end view/device/location tracking and dashboard were not found. |

**Required follow-up:** add tests for assigned/unassigned events, long names, expired/unpublished invitations, regenerated tokens, invalid token responses, noindex, and access-rate limits.

## Phase 08 — WhatsApp Sharing

**Overall status: PARTIAL**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Editable message template | PRESENT | `WhatsAppMessageEditor.tsx` and invitation settings integration exist. |
| Variable substitution / preview | PARTIAL / UNVERIFIED | Preview UI exists; test guest/event variables and missing values. |
| Individual WhatsApp share | PARTIAL / UNVERIFIED | Link/message editor exists; verify actual guest-row share action, phone normalization, and desktop/mobile behavior. |
| Message preview before opening WhatsApp | PRESENT / PARTIAL | Editor preview exists; confirm per-recipient preview workflow. |
| Bulk WhatsApp requests | PARTIAL | Admin controller has bulk-request handling and schema supports requests; customer request flow and end-to-end lifecycle need verification. |
| Bulk WhatsApp from guest page | MISSING / TODO | Guest page handler says TODO for opening the bulk WhatsApp modal. |
| WhatsApp Business API automated delivery | FUTURE / MISSING | Environment placeholders only; no verified send/delivery integration. |
| Message analytics | MISSING / not found | No complete share analytics pipeline/dashboard was identified. |

**Required follow-up:** complete individual share and recipient-specific preview, build the bulk request flow, and clearly label automated Business API sending as future until implemented and approved.

## Phase 09 — Admin Panel

**Overall status: PARTIAL**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Admin-only API authorization | PRESENT | Admin routes apply authentication and ADMIN role middleware. |
| Admin dashboard stats | PRESENT / PARTIAL | Dashboard stats controller and UI exist. Documented trend charts and recent-activity panels were not confirmed. |
| User list/details/status | PRESENT / PARTIAL | User listing/detail/status endpoints and pages exist. Admin password reset, account deletion and all user actions need verification. |
| Invitation management | PRESENT / PARTIAL | Listing endpoint/page exist; full preview/guest details/delete workflow needs verification. |
| Template management | PARTIAL | Template CRUD endpoints and UI exist; versioning, archive/duplicate, feature configuration, and usage stats need verification. |
| Category management CRUD/reorder | MISSING / not found | Category listing exists, but complete category admin routes/page were not found. |
| Bulk request management | PRESENT / PARTIAL | API status updates and dashboard count exist; full request details/notes/contact workflow needs verification. |
| Separate admin login | PARTIAL | Role-based admin pages exist; separate login flow was not established. |
| Admin audit logging | MISSING / not found | No durable admin audit-log implementation was identified. |
| Admin rate limiting | PARTIAL / UNVERIFIED | Global limiter exists; specific admin controls and tests need verification. |

**Required follow-up:** finish category CRUD/reordering, full template lifecycle, user/invitation action coverage, activity charts, and immutable audit logs.

## Phase 10 — Publishing & Security

**Overall status: PARTIAL / NOT LAUNCH-READY UNTIL VERIFIED**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Publish/unpublish APIs | PRESENT | Invitation controller/routes and editor publish button exist. |
| Publish validation (names, events, dates) | PARTIAL / UNVERIFIED | Test that incomplete invitations cannot publish. |
| Public common/personalized rendering | PRESENT / UNVERIFIED | Routes and template server renderer exist. |
| QR code generation/download/print sheet | MISSING / not found | No QR generation package/API/UI was identified in the reviewed tree. |
| Helmet/CORS/compression/global rate limit | PRESENT | Configured in API entry point; production allowlist and rate-limit behavior need review. |
| Input validation | PRESENT / PARTIAL | Zod is used in several controllers; validate every public/admin route. |
| Password hashing/JWT | PRESENT | bcrypt and JWT are used; token/session lifecycle gaps remain. |
| CSRF strategy | UNVERIFIED | Bearer-token architecture may reduce some CSRF exposure, but browser storage and CORS must be reviewed. |
| Upload hardening | UNVERIFIED | Validate file size/type, image decoding, path traversal resistance, auth/ownership and storage location. |
| Ownership checks | UNVERIFIED | Review every controller to ensure users can only access their own invitation/guest/media IDs. |
| Invitation expiry (410) | UNVERIFIED | Explicit expiry handling was not established. |
| Error pages/statuses | PARTIAL | Generic error component exists; 403/404/410/500 behavior needs verification. |
| Audit logs | MISSING / not found | No complete audit event pipeline was identified. |
| HTTPS/security configuration in production | UNVERIFIED | Must be verified at hosting/reverse-proxy level. |
| Data encryption/retention/privacy | UNVERIFIED | No complete at-rest encryption, retention, or privacy verification. |

**Required follow-up:** perform a dedicated security review before production. Specifically test cross-user IDOR, admin access, token leakage, expired/unpublished access, malicious uploads, CORS, rate limits, and safe error responses.

## Phase 11 — Testing & Deployment

**Overall status: PARTIAL / UNVERIFIED**

| Requirement | Status | Evidence / notes |
|---|---|---|
| CI build workflow | PRESENT / PARTIAL | `.github/workflows/build.yml` installs, generates Prisma, builds API/web. |
| Automated tests in CI | MISSING | Workflow does not run `npm test`, lint, or E2E. |
| Unit tests | MISSING / not found in reviewed tree | No meaningful test suite coverage was established. |
| Integration tests | MISSING / not found | Not established. |
| E2E test script | PRESENT / UNVERIFIED | `scripts/e2e-phase03.mjs` exists, but was not executed during this static audit. It focuses on template rendering/RSVP/content editing, not all 13 phases. |
| Lint/format checks in CI | MISSING | Workflow does not run lint or formatting checks. |
| Load/performance testing | MISSING / not run | No k6/Artillery test run or benchmark report was found. |
| Lighthouse/accessibility testing | MISSING / not run | No evidence found. |
| Production deployment workflow | MISSING / not found | Current workflow builds only. |
| Error monitoring/uptime alerts | MISSING / UNVERIFIED | No confirmed Sentry/uptime integration. |
| Automated backups/restore drills | MISSING / UNVERIFIED | No evidence in repository. |
| Launch checklist/security sign-off | MISSING / not verified | Not evidenced. |

**Required follow-up:** add CI stages for lint, typecheck, tests, E2E, and migration validation. Run the checks against a clean environment and record actual pass/fail output. Configure monitoring, backups, restore drills, and deployment smoke tests.

## Phase 12 — Future Features / Monetization Roadmap

**Overall status: FUTURE (not part of the initial MVP unless scope changes)**

The phase document itself classifies these as post-MVP/future. They should be tracked as planned work, not claimed as shipped:

- **Payments and monetization:** Razorpay/Stripe, subscriptions, invoices, refunds, premium access/licensing — **FUTURE**.
- **Premium template purchasing and marketplace** — **FUTURE**.
- **Visual template builder / element library / save-as-template** — **PARTIAL only at best**; the current editor is not the full planned builder.
- **Multi-language (including Gujarati/Hindi and RTL)** — **FUTURE**.
- **WhatsApp Business API automation, delivery/read receipts, chatbot** — **FUTURE**.
- **AI invitation copy, smart suggestions, natural-language creation** — **FUTURE**.
- **Template designer marketplace and vendor marketplace** — **FUTURE**.
- **MP4/video export and video editor** — **FUTURE**; the product vision says animated web invitation first and MP4 export after renderer/personalization stability.
- **Voice invitation, mobile apps, corporate teams, white label, public API/webhooks, calendar/email/social integrations, referral program** — **FUTURE**.

**Required follow-up:** retain a roadmap with priority, owner, dependencies, and acceptance criteria. Do not mix future features into MVP acceptance without explicitly updating scope.

## Phase 13 — RSVP, Analytics, Guest Groups, QR, Countdown & Advanced Gallery

**Overall status: PARTIAL; RSVP/countdown have foundations, several headline features remain missing**

| Requirement | Status | Evidence / notes |
|---|---|---|
| Public RSVP submission | PRESENT / UNVERIFIED | `rsvp.controller.ts`, public RSVP route, `RsvpForm.tsx`. Test response updates and duplicate submissions. |
| RSVP stats/list for owner | PRESENT / PARTIAL | Protected stats endpoint exists; verify invitation ownership and pagination/export. |
| RSVP export | MISSING / not found | No export endpoint was found. |
| RSVP notifications | MISSING / not found | No in-app/email notification pipeline was identified. |
| RSVP form and invitation integration | PRESENT / UNVERIFIED | Component and template RSVP section exist; run end-to-end checks. |
| Analytics collection (views, unique views, device, location, referral, time) | MISSING / PARTIAL | Prisma Analytics model exists, but complete event collection and API/dashboard were not found. |
| Analytics dashboard and export | MISSING / not found | No customer analytics page/API was identified. |
| Guest group management | MISSING | `groupName` string exists, but group CRUD and group assignment API are not implemented as a full group feature. |
| QR generation/download/print sheets | MISSING / not found | No QR implementation identified. |
| Countdown timer | PRESENT / PARTIAL | `Countdown.tsx` exists; timezone handling, multiple countdowns, configurable formats, and edge cases require tests. |
| Advanced gallery lightbox/slideshow/captions | PARTIAL / missing | Basic gallery component exists; full advanced interactions were not established. |
| Video gallery support | MISSING / not found | No confirmed video upload/playback pipeline. |
| Image compression options | PARTIAL | Server-side optimization exists; user-facing compression controls were not found. |
| Phase 13 automated tests | MISSING / not run | No dedicated test suite/CI execution evidence was found. |

**Required follow-up:** complete analytics instrumentation/dashboard, group CRUD, QR generation, RSVP export/notifications, and advanced gallery. Test RSVP authorization, guest counts, repeated submissions, and personalized guest/event relationships.

## Cross-cutting edge-case checklist

The phase docs require edge cases that should be turned into executable tests. Current status: **UNVERIFIED unless a test is added and run**.

- [ ] Very long guest names and multiple family members.
- [ ] One event, all events, and no assigned events.
- [ ] Event deletion after guest assignment.
- [ ] Template change after an invitation is created; preserve or migrate existing content safely.
- [ ] Media deletion after upload; clean up database and files consistently.
- [ ] Invalid/empty/unsupported Excel files, duplicate mobiles/names, invalid phone numbers, unknown events, partial import failures.
- [ ] Guest token collision, regeneration, old-token rejection, invalid token, expired invitation.
- [ ] Invitation unpublished while a guest is viewing or opens a previously shared link.
- [ ] Duplicate RSVP and RSVP edits; accepted/declined guest-count rules.
- [ ] Long event/venue names and timezone/date boundaries.
- [ ] Large images, incorrect extensions/MIME, corrupt images, oversized uploads, slow network and retry.
- [ ] Cross-user invitation/guest/media IDs; customer attempting admin APIs.
- [ ] Mobile Safari/Chrome and desktop Chrome/Firefox; reduced motion and keyboard navigation.
- [ ] Concurrent editing, save failure, refresh during unsaved edits, and stale form data.
- [ ] Rate-limit behavior and safe server errors.

## Immediate implementation priority

### P0 — Before any public launch
1. Run install, Prisma generation, API build, web build, lint/typecheck and E2E on a clean checkout; fix all failures and add the checks to CI.
2. Review every API controller for ownership checks and admin-role enforcement; add IDOR/security tests.
3. Verify production environment secrets, CORS, HTTPS, rate limits, upload restrictions, and no demo credentials.
4. Add and test database migrations, backups, restore procedure, monitoring and deployment smoke checks.
5. Verify publish/unpublish/expiry behavior, token privacy, and safe error pages.

### P1 — Required for the stated MVP
1. Agree whether the editor is form-based or truly Canva-like; the documented three-panel editor is not implemented.
2. Complete the launch template count (currently three template definition folders were found, versus the planned 10–12).
3. Complete guest import validation, export, bulk operations and individual WhatsApp share flow.
4. Complete the promised RSVP workflow and clarify which Phase 13 items are launch requirements.
5. Add analytics, guest groups and QR only if they remain part of the MVP/Phase 13 launch scope.

### P2 — Later roadmap
Payments, premium plans, marketplace, AI, full WhatsApp Business API, multilingual support, MP4 export, voice invitations, mobile apps, corporate/white-label and vendor marketplace.

## Verification log

- [x] Repository tree inspected.
- [x] Master TODO and all 13 phase documents reviewed for stated scope.
- [x] Main schema, API entry point, major controllers/routes, template definitions, key frontend pages, and existing E2E script inspected.
- [ ] Dependencies installed from a clean checkout.
- [ ] Prisma client generation run.
- [ ] Database migrations applied to a clean database.
- [ ] API/web builds executed and passed.
- [ ] Lint/typecheck executed and passed.
- [ ] E2E suite executed and passed.
- [ ] Browser/mobile/manual flows verified.
- [ ] Security, accessibility, performance, deployment, backup and restore checks completed.

**Audit outcome:** Static review is complete for the documented phase scope and the key implementation paths inspected. Runtime verification is still outstanding; therefore this is a thorough gap audit, not a certification that every behavior has been tested.
