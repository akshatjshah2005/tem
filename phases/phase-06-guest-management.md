# Phase 06 — Guest Management

**Duration:** 2 weeks
**Goal:** Guest CRUD, Excel import, and event assignment

---

## 6.1 Guest Management UI

### Guest List
```
┌─────────────────────────────────────────────────────┐
│  Guest List — Akshat Wedding (245 guests)            │
├─────────────────────────────────────────────────────┤
│  [+ Add Guest] [Import Excel] [Export] [Bulk Actions]│
├─────────────────────────────────────────────────────┤
│  Search: [________________] Filter: [All ▼]         │
├─────────────────────────────────────────────────────┤
│  ☐ Name          │ Mobile      │ Events │ Link    │ Status │ Actions │
├─────────────────────────────────────────────────────┤
│  ☐ Rahul Shah    │ 9876543210  │ 2      │ [Copy] │ [WA]  │ ⋮       │
│  ☐ Priya Patel   │ 9876543211  │ 4      │ [Copy] │ [WA]  │ ⋮       │
│  ☐ Amit Mehta    │ 9876543212  │ 1      │ [Copy] │ [WA]  │ ⋮       │
│  ☐ Sneha Jain    │ 9876543213  │ 5      │ [Copy] │ [WA]  │ ⋮       │
├─────────────────────────────────────────────────────┤
│  Showing 1-20 of 245  [< 1 2 3 ... 13 >]           │
└─────────────────────────────────────────────────────┘
```

### Guest Columns
- [ ] Checkbox (for bulk actions)
- [ ] Name
- [ ] Mobile
- [ ] Email (optional)
- [ ] Events count
- [ ] Personalized link (copy button)
- [ ] WhatsApp button
- [ ] Status
- [ ] Actions menu

### Guest Actions
- [ ] Edit guest (modal)
- [ ] View guest details
- [ ] Copy personalized link
- [ ] Open WhatsApp with message
- [ ] Regenerate link
- [ ] Delete guest (with confirmation)
- [ ] Bulk delete selected
- [ ] Bulk assign events

---

## 6.2 Add/Edit Guest Form

### Add Guest Modal
```
┌─────────────────────────────────┐
│  Add Guest                      │
│                                 │
│  Name *                         │
│  [Rahul Shah____________]       │
│                                 │
│  Mobile *                       │
│  [+91][9876543210_____]         │
│                                 │
│  Email (optional)               │
│  [rahul@email.com_____]         │
│                                 │
│  Group (optional)               │
│  [Family ▼]                     │
│                                 │
│  Events *                       │
│  ☐ Haldi                        │
│  ☐ Mehendi                      │
│  ☑ Sangeet                      │
│  ☑ Wedding                      │
│  ☐ Reception                    │
│                                 │
│  [Cancel]              [Save]   │
└─────────────────────────────────┘
```

### Validation
- [ ] Name: required, 2–100 chars
- [ ] Mobile: required, valid Indian format
- [ ] Email: optional, valid format
- [ ] Events: at least one selected
- [ ] Duplicate mobile check

---

## 6.3 Excel Import System

### Upload Flow
```
Step 1: Upload Excel
Step 2: Preview & Validate
Step 3: Confirm Import
```

### Step 1: Upload
```
┌─────────────────────────────────┐
│  Import Guest List              │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   Drag & drop Excel     │   │
│  │   or                    │   │
│  │   [Browse File]         │   │
│  │                         │   │
│  │   .xlsx, .xls, .csv     │   │
│  │   Max 5MB               │   │
│  └─────────────────────────┘   │
│                                 │
│  [Download Template]            │
└─────────────────────────────────┘
```

### Excel Template Format
| Name | Mobile | Email | Events |
|------|--------|-------|--------|
| Rahul Shah | 9876543210 | rahul@email.com | Wedding, Reception |
| Priya Patel | 9876543211 | | Mehendi, Wedding |
| Amit Mehta | 9876543212 | amit@email.com | Wedding |

### Step 2: Preview & Validate
```
┌─────────────────────────────────┐
│  Import Preview                 │
│                                 │
│  ✓ 245 valid guests             │
│  ✗ 7 errors                     │
│                                 │
│  Errors:                        │
│  Row 12: Missing name           │
│  Row 15: Invalid mobile         │
│  Row 23: Unknown event "Party"  │
│  Row 45: Duplicate mobile       │
│  Row 67: Empty row              │
│  Row 89: Mobile too short       │
│  Row 102: Duplicate name        │
│                                 │
│  [Download Errors] [Fix & Re-upload] │
│                                 │
│  Preview (first 10 rows):       │
│  ┌──────┬──────────┬─────┐     │
│  │ Name │ Mobile   │ Ev  │     │
│  ├──────┼──────────┼─────┤     │
│  │ ...  │ ...      │ ... │     │
│  └──────┴──────────┴─────┘     │
│                                 │
│  [Cancel]     [Import 245]     │
└─────────────────────────────────┘
```

### Validation Rules
- [ ] Required: Name, Mobile
- [ ] Mobile: 10 digits, valid Indian format
- [ ] Email: valid format (if provided)
- [ ] Events: must exist in invitation
- [ ] No duplicate mobile numbers
- [ ] No empty rows
- [ ] No duplicate names (warning, not error)

### Step 3: Import
- [ ] Show progress bar
- [ ] Import in batches (100 at a time)
- [ ] Generate unique tokens for each guest
- [ ] Generate personalized links
- [ ] Show success summary
- [ ] Handle partial failures

---

## 6.4 Event Assignment

### Bulk Assignment
```
┌─────────────────────────────────┐
│  Assign Events to Guests        │
│                                 │
│  Selected: 50 guests            │
│                                 │
│  Events:                        │
│  ☑ Haldi                        │
│  ☑ Mehendi                      │
│  ☑ Sangeet                      │
│  ☑ Wedding                      │
│  ☑ Reception                    │
│                                 │
│  [Assign to All]                │
└─────────────────────────────────┘
```

### Individual Assignment
- [ ] Click guest → Show event checkboxes
- [ ] Toggle events on/off
- [ ] Auto-save changes
- [ ] Update personalized link if events change

---

## 6.5 Guest API

```
GET    /api/invitations/:id/guests              # List guests (paginated)
POST   /api/invitations/:id/guests              # Add guest
POST   /api/invitations/:id/guests/bulk         # Add multiple guests
GET    /api/invitations/:id/guests/:guestId     # Get guest details
PUT    /api/invitations/:id/guests/:guestId     # Update guest
DELETE /api/invitations/:id/guests/:guestId     # Delete guest
DELETE /api/invitations/:id/guests/bulk         # Bulk delete
PUT    /api/invitations/:id/guests/:guestId/events # Assign events
PUT    /api/invitations/:id/guests/bulk/events  # Bulk assign events
POST   /api/invitations/:id/guests/import       # Import from Excel
GET    /api/invitations/:id/guests/export       # Export to Excel
POST   /api/invitations/:id/guests/:guestId/regenerate-link # Regenerate link
```

---

## 6.6 Guest Stats

### Per Invitation Stats
```typescript
interface GuestStats {
  total: number;
  withLink: number;
  sent: number;
  opened: number;
  rsvpReceived: number;
  attending: number;
  notAttending: number;
  pending: number;
}
```

### Dashboard Display
```
┌─────────────────────────────────┐
│  Guest Statistics               │
│                                 │
│  Total: 245                     │
│  Links Generated: 245 (100%)   │
│  Sent: 200 (82%)               │
│  Opened: 180 (73%)             │
│  RSVP: 150 (61%)               │
│  Attending: 140 (57%)          │
│  Not Attending: 10 (4%)        │
│  Pending: 95 (39%)             │
└─────────────────────────────────┘
```

---

## 6.7 Search & Filter

### Search
- [ ] Search by name
- [ ] Search by mobile
- [ ] Search by email
- [ ] Fuzzy search (typo tolerance)

### Filters
- [ ] Filter by event
- [ ] Filter by status
- [ ] Filter by group
- [ ] Filter by link status

### Sort
- [ ] Sort by name (A-Z, Z-A)
- [ ] Sort by mobile
- [ ] Sort by event count
- [ ] Sort by status
- [ ] Sort by created date

---

## Deliverables

- [ ] Guest CRUD operations
- [ ] Excel import with validation
- [ ] Event assignment (individual + bulk)
- [ ] Personalized link generation
- [ ] Guest search and filtering
- [ ] Guest statistics
- [ ] Export to Excel
- [ ] Bulk actions (delete, assign events)

---

## 6.8 Guest Groups (Phase 13)

> **Note:** Guest Groups feature is detailed in [Phase 13 — RSVP, Analytics, Guest Groups](phase-13-rsvp-analytics.md#133-guest-groups)

### Quick Reference
- [ ] Create groups (Family, Friends, Office, etc.)
- [ ] Assign guests to groups
- [ ] Bulk assign events by group
- [ ] Filter guests by group
- [ ] Group-based messaging
