# Phase 02 — Authentication & Customer Dashboard

**Duration:** 2 weeks
**Goal:** User registration, login, and customer dashboard

---

## 2.1 Authentication System

### Registration
- [ ] Registration form (name, email, mobile, password)
- [ ] Client-side validation:
  - [ ] Name: required, 2–100 chars
  - [ ] Email: required, valid format, unique
  - [ ] Mobile: required, valid Indian format (+91), unique
  - [ ] Password: required, min 8 chars, 1 uppercase, 1 number
- [ ] Server-side validation
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Generate JWT token on successful registration
- [ ] Return user object (excluding password)
- [ ] Rate limiting: 5 registrations per IP per hour

### Login
- [ ] Login form (email + password)
- [ ] Validate credentials against database
- [ ] Generate JWT token on success
- [ ] Return user object + token
- [ ] Rate limiting: 10 attempts per IP per 15 minutes
- [ ] Account lockout after 5 failed attempts (15 min)

### Token Management
- [ ] JWT access token (7 days expiry)
- [ ] Token refresh mechanism
- [ ] Token validation middleware
- [ ] Token revocation on logout
- [ ] Secure token storage (httpOnly cookie or memory)

### Auth Middleware
```javascript
// Protected route example
router.get('/dashboard', authMiddleware, dashboardController);
```
- [ ] Verify JWT token
- [ ] Attach user to request object
- [ ] Role-based access control (customer vs admin)
- [ ] Handle expired/invalid tokens

---

## 2.2 API Endpoints — Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/me
POST   /api/auth/change-password
POST   /api/auth/forgot-password     (future)
POST   /api/auth/reset-password      (future)
POST   /api/auth/verify-email        (future)
POST   /api/auth/verify-mobile       (future)
```

---

## 2.3 Customer Dashboard

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│  Header (Logo, User Menu, Notifications)    │
├─────────────────────────────────────────────┤
│  Stats Row                                   │
│  [Total Invitations] [Total Guests] [...]   │
├─────────────────────────────────────────────┤
│  Actions Bar                                │
│  [+ Create New Invitation]  [Search...]    │
├─────────────────────────────────────────────┤
│  Invitation Cards Grid                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │      │
│  └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────┤
│  Pagination                                 │
└─────────────────────────────────────────────┘
```

### Dashboard Components
- [ ] Header with logo and user menu
- [ ] Stats overview cards:
  - [ ] Total Invitations
  - [ ] Published Invitations
  - [ ] Total Guests
  - [ ] Personalized Links Generated
- [ ] Search/filter bar
- [ ] Invitation cards grid
- [ ] Pagination
- [ ] Empty state (no invitations yet)
- [ ] Loading states

### Invitation Card
```
┌─────────────────────────────────┐
│  [Template Preview Image]       │
│                                 │
│  AKSHAT & PRIYA WEDDING        │
│  Wedding Template 03            │
│  Category: Wedding              │
│                                 │
│  Guests: 245                    │
│  Personalization: ON            │
│  Status: Published              │
│                                 │
│  Created: 15 Jan 2026           │
│  Updated: 20 Jan 2026           │
│                                 │
│  [Edit] [View] [Guests] [⋯]   │
└─────────────────────────────────┘
```

- [ ] Template preview image
- [ ] Invitation name
- [ ] Template name
- [ ] Category
- [ ] Guest count
- [ ] Personalization status
- [ ] Publication status
- [ ] Created/updated dates
- [ ] Action buttons:
  - [ ] Edit (navigate to editor)
  - [ ] View (open preview in new tab)
  - [ ] Guests (navigate to guest management)
  - [ ] More menu (Duplicate, Publish/Unpublish, Delete)

### Card Actions
- [ ] Edit → Navigate to invitation editor
- [ ] View → Open `/i/{slug}` in new tab
- [ ] Guests → Navigate to guest management
- [ ] More menu:
  - [ ] Duplicate invitation
  - [ ] Publish/Unpublish toggle
  - [ ] Delete (with confirmation)

---

## 2.4 API Endpoints — Dashboard

```
GET    /api/invitations              # List user's invitations
GET    /api/invitations/:id          # Get invitation details
POST   /api/invitations              # Create new invitation
PUT    /api/invitations/:id          # Update invitation
DELETE /api/invitations/:id          # Delete invitation
POST   /api/invitations/:id/duplicate # Duplicate invitation
PUT    /api/invitations/:id/publish   # Publish invitation
PUT    /api/invitations/:id/unpublish # Unpublish invitation
GET    /api/invitations/:id/stats     # Get invitation statistics
```

---

## 2.5 Create Invitation Flow

### Step 1: Name & Category
```
┌─────────────────────────────────┐
│  Create New Invitation          │
│                                 │
│  Invitation Name                │
│  [________________________]     │
│  e.g., "Akshat Wedding"        │
│                                 │
│  Category                       │
│  [Wedding ▼]                    │
│                                 │
│  [Cancel]              [Next →] │
└─────────────────────────────────┘
```

- [ ] Invitation name input
- [ ] Category dropdown (fetched from API)
- [ ] Validation: name required, category required
- [ ] Auto-generate slug from name
- [ ] "Next" button (disabled until valid)

### Step 2: Template Selection
```
┌─────────────────────────────────┐
│  Select Template                │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │      │ │      │ │      │   │
│  │  T1  │ │  T2  │ │  T3  │   │
│  │      │ │      │ │      │   │
│  │ Name │ │ Name │ │ Name │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │      │ │      │ │      │   │
│  │  T4  │ │  T5  │ │  T6  │   │
│  │      │ │      │ │      │   │
│  │ Name │ │ Name │ │ Name │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  [← Back]            [Select →] │
└─────────────────────────────────┘
```

- [ ] Template grid (filtered by selected category)
- [ ] Template card with:
  - [ ] Preview image
  - [ ] Template name
  - [ ] Feature badges (Multiple Events, Gallery, etc.)
  - [ ] Free/Premium badge
  - [ ] Hover effect with preview button
- [ ] Template preview modal
- [ ] "Use Template" button
- [ ] "Back" button to return to Step 1

### Step 3: Confirmation
- [ ] Summary of selection
- [ ] "Create" button
- [ ] Navigate to editor on success

---

## 2.6 Client-Side Routing

```
/                           → Landing page (future)
/login                      → Login page
/register                   → Registration page
/dashboard                  → Customer dashboard
/dashboard/create           → Create invitation wizard
/dashboard/invitations/:id  → Invitation editor
/dashboard/invitations/:id/guests → Guest management
/dashboard/settings         → Account settings
/admin                      → Admin dashboard
/admin/users                → User management
/admin/templates            → Template management
/admin/categories           → Category management
/admin/invitations          → Invitation management
/admin/bulk-requests        → Bulk WhatsApp requests
/i/:slug                    → Public invitation (common)
/i/:slug/:token             → Public invitation (personalized)
```

---

## 2.7 UI Components to Build

- [ ] Button component (variants: primary, secondary, danger, ghost)
- [ ] Input component (with label, error, helper text)
- [ ] Select/Dropdown component
- [ ] Card component
- [ ] Modal component
- [ ] Toast/Notification component
- [ ] Loading spinner/skeleton
- [ ] Empty state component
- [ ] Confirmation dialog
- [ ] Avatar component
- [ ] Badge component
- [ ] Pagination component
- [ ] Search input component

---

## Deliverables

- [ ] Working registration and login
- [ ] JWT authentication working
- [ ] Customer dashboard with invitation list
- [ ] Create invitation wizard (3 steps)
- [ ] Invitation card actions
- [ ] Responsive design (mobile + desktop)
- [ ] Error handling and loading states
