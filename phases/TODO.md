# DIGITAL INVITATION PLATFORM — MASTER TODO

> **Current product direction:** See [Product Vision V2](product-vision-v2.md). This supersedes older wording that ruled out video. The product is a cinematic, animated web invitation first, with MP4 export planned after the editor and scene renderer are stable.


## Project Overview
Web-based animated digital invitation platform with guest-level personalization and WhatsApp sharing.

**Core USP:** Create once → Personalize for every guest → Share individually

---

## Tech Stack (Recommended)

| Layer | Technology |
|-------|-----------|
| Frontend | React/Next.js + TypeScript |
| Backend | Node.js (Express/NestJS) or Python (FastAPI/Django) |
| Database | PostgreSQL + Redis (caching) |
| File Storage | AWS S3 / Cloudflare R2 |
| Template Engine | Custom JSON-based renderer (React components) |
| Animation | Framer Motion / GSAP / CSS animations |
| WhatsApp | WhatsApp Business API / Deep Links |
| Auth | JWT + bcrypt / NextAuth |
| Excel Parsing | SheetJS (xlsx) |
| Hosting | Vercel (frontend) + Railway/Render (backend) |
| CDN | Cloudflare |

---

## Development Phases

| Phase | Name | Status | File |
|-------|------|--------|------|
| 01 | Infrastructure & Database | ⬜ Pending | [phase-01-infrastructure.md](phases/phase-01-infrastructure.md) |
| 02 | Authentication & Dashboard | ⬜ Pending | [phase-02-auth-dashboard.md](phases/phase-02-auth-dashboard.md) |
| 03 | Template Engine | ⬜ Pending | [phase-03-template-engine.md](phases/phase-03-template-engine.md) |
| 04 | Invitation Editor | ⬜ Pending | [phase-04-invitation-editor.md](phases/phase-04-invitation-editor.md) |
| 05 | Events & Media | ⬜ Pending | [phase-05-events-media.md](phases/phase-05-events-media.md) |
| 06 | Guest Management | ⬜ Pending | [phase-06-guest-management.md](phases/phase-06-guest-management.md) |
| 07 | Personalization Engine | ⬜ Pending | [phase-07-personalization.md](phases/phase-07-personalization.md) |
| 08 | WhatsApp Sharing | ⬜ Pending | [phase-08-whatsapp-sharing.md](phases/phase-08-whatsapp-sharing.md) |
| 09 | Admin Panel | ⬜ Pending | [phase-09-admin-panel.md](phases/phase-09-admin-panel.md) |
| 10 | Publishing & Security | ⬜ Pending | [phase-10-publishing-security.md](phases/phase-10-publishing-security.md) |
| 11 | Testing & Deployment | ⬜ Pending | [phase-11-testing-deployment.md](phases/phase-11-testing-deployment.md) |
| 12 | Future Features | ⬜ Pending | [phase-12-future-features.md](phases/phase-12-future-features.md) |
| 13 | RSVP, Analytics, Guest Groups, QR, Countdown, Advanced Gallery | ⬜ Pending | [phase-13-rsvp-analytics.md](phases/phase-13-rsvp-analytics.md) |

---

## MVP + Phase 13 Scope (Phase 01–10 + 13)

### Customer Features
- [ ] Registration / Login (email + mobile + password)
- [ ] Dashboard with invitation cards
- [ ] Create invitation flow (name → category → template)
- [ ] Template selection (10–12 templates, visual cards)
- [ ] Template customization (Canva-like editor)
- [ ] Multiple event system (add/edit/delete/reorder)
- [ ] Photo upload + gallery
- [ ] Preview (desktop + mobile + personalized view)
- [ ] Publish / Unpublish
- [ ] Guest management (CRUD)
- [ ] Excel guest import with validation
- [ ] Guest-to-event assignment
- [ ] Personalization ON/OFF toggle
- [ ] Unique token-based URL generation
- [ ] Dynamic guest name rendering
- [ ] WhatsApp individual sharing
- [ ] WhatsApp message template with variables
- [ ] Message preview before sharing
- [ ] RSVP system (response form, dashboard)
- [ ] Analytics dashboard (views, device breakdown, locations)
- [ ] Guest groups (Family, Friends, Office, etc.)
- [ ] QR code generation (common + personalized)
- [ ] Countdown timer (auto-calculated)
- [ ] Advanced gallery (lightbox, slideshow, captions, video)

### Admin Features
- [ ] Admin login (separate from customer)
- [ ] Admin dashboard (stats overview)
- [ ] User management (view/disable/enable/delete)
- [ ] Category management (CRUD + reorder)
- [ ] Template management (CRUD + publish/unpublish)
- [ ] Template configuration (features, variables, editable fields)
- [ ] Template versioning
- [ ] Invitation management (view all)
- [ ] Bulk WhatsApp request management

---

## Edge Cases to Handle

- [ ] Guest with very long name
- [ ] Guest with multiple family members
- [ ] Guest with only one event
- [ ] Guest with all events
- [ ] Guest with no assigned event
- [ ] Event deleted after guest assignment
- [ ] Template changed after invitation creation
- [ ] Image deleted after upload
- [ ] Invalid Excel format
- [ ] Duplicate guests in import
- [ ] Invalid mobile numbers
- [ ] Invitation unpublished while guest accessing
- [ ] Expired invitation access
- [ ] Slow network performance
- [ ] Long venue/event names
- [ ] Different image sizes/ratios

---

## Database Entities

```
USER
├── has many → INVITATION
├── has many → GUEST (via invitation)

INVITATION
├── belongs to → USER
├── belongs to → TEMPLATE
├── has many → EVENT
├── has many → GUEST
├── has one → WHATSAPP_MESSAGE
├── has many → MEDIA

TEMPLATE
├── has many → TEMPLATE_VERSION
├── has many → SECTION
├── belongs to → CATEGORY

EVENT
├── belongs to → INVITATION
├── has many → GUEST (via GUEST_EVENT)

GUEST
├── belongs to → INVITATION
├── has many → EVENT (via GUEST_EVENT)
├── has one → PERSONALIZED_LINK

GUEST_EVENT (junction)
├── belongs to → GUEST
├── belongs to → EVENT

PERSONALIZED_LINK
├── belongs to → GUEST
├── unique token → URL

MEDIA
├── belongs to → INVITATION

CATEGORY
├── has many → TEMPLATE

WHATSAPP_MESSAGE
├── belongs to → INVITATION

BULK_REQUEST
├── belongs to → USER
├── belongs to → INVITATION
```

---

## Key Architecture Decisions

1. **Template Engine**: JSON config + React components (not hard-coded HTML)
2. **Dynamic Rendering**: ONE template + GUEST DATA + EVENT DATA = PERSONALIZED INVITATION
3. **Token Security**: Random tokens, not predictable IDs
4. **Mobile-First**: Invitations optimized for WhatsApp mobile opening
5. **Separation of Concerns**: Template Design ↔ Customer Content ↔ Guest Personalization ↔ Event Data
6. **Versioning**: Templates versioned so updates don't break existing invitations

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 01 | 2 weeks | Week 2 |
| 02 | 2 weeks | Week 4 |
| 03 | 3 weeks | Week 7 |
| 04 | 3 weeks | Week 10 |
| 05 | 2 weeks | Week 12 |
| 06 | 2 weeks | Week 14 |
| 07 | 2 weeks | Week 16 |
| 08 | 1 week | Week 17 |
| 09 | 2 weeks | Week 19 |
| 10 | 2 weeks | Week 21 |
| 11 | 2 weeks | Week 23 |
| 13 | 3 weeks | Week 26 |
| **MVP + Phase 13 Total** | | **~26 weeks** |

---

## Priority Order

1. **P0 (Must Have for MVP):** Auth, Dashboard, Template System, Editor, Events, Guests, Personalization, WhatsApp, Admin, RSVP, Analytics, Guest Groups, QR Codes, Countdown, Advanced Gallery
2. **P1 (Should Have):** Payment System, Premium Templates, Multi-Language, Template Builder
3. **P2 (Nice to Have):** AI Features, Visual Builder, Marketplace, Automated WhatsApp
4. **P3 (Future):** Mobile App, Enterprise Features, White Label, API Platform
