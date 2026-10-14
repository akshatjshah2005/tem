# Phase 09 — Admin Panel

**Duration:** 2 weeks
**Goal:** Admin dashboard, user management, template management

---

## 9.1 Admin Layout

```
┌─────────────────────────────────────────────────────┐
│  Admin Header                                        │
│  [Logo] [Admin Panel]           [Admin User ▼]      │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Sidebar │         Main Content Area                │
│          │                                          │
│  Dashboard│                                         │
│  Users   │                                          │
│  Invites │                                          │
│  Templates│                                         │
│  Categories│                                        │
│  Bulk WA │                                          │
│  Settings│                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

---

## 9.2 Admin Dashboard

### Stats Overview
```
┌─────────────────────────────────────────────────────┐
│  Admin Dashboard                                     │
├─────────┬─────────┬─────────┬─────────┬─────────────┤
│  Users  │Invites  │Published│ Guests  │ Links Gen   │
│   1,245 │   3,892 │   2,156 │  45,230 │     42,100  │
├─────────┼─────────┼─────────┼─────────┼─────────────┤
│WhatsApp │Bulk Req │Templates│Premium  │  Active     │
│  Shares │ Pending │ Active  │  Templates│  Users     │
│  38,450 │      12 │      45 │      15 │        890  │
└─────────┴─────────┴─────────┴─────────┴─────────────┘
```

### Charts
- [ ] User registration trend (line chart)
- [ ] Invitation creation trend (line chart)
- [ ] Category distribution (pie chart)
- [ ] Template popularity (bar chart)
- [ ] Guest activity (area chart)

### Recent Activity
- [ ] Recent registrations
- [ ] Recent invitations
- [ ] Recent bulk requests
- [ ] System alerts

---

## 9.3 User Management

### User List
```
┌─────────────────────────────────────────────────────┐
│  User Management                                     │
├─────────────────────────────────────────────────────┤
│  Search: [________________] Filter: [All ▼]         │
├─────────────────────────────────────────────────────┤
│  Name │ Email │ Mobile │ Invitations │ Status │ Actions│
├─────────────────────────────────────────────────────┤
│  Akshat│ a@b.c│ 9876..│     5      │ Active │ ⋮     │
│  Priya │ p@b.c│ 9876..│     3      │ Active │ ⋮     │
│  Amit  │ a@b.c│ 9876..│     1      │ Disabled│ ⋮    │
├─────────────────────────────────────────────────────┤
│  Showing 1-20 of 1,245  [< 1 2 3 ... 63 >]         │
└─────────────────────────────────────────────────────┘
```

### User Actions
- [ ] View user details
- [ ] View user's invitations
- [ ] Disable/Enable account
- [ ] Delete account (with confirmation)
- [ ] Reset password (admin)

### User Detail View
```
┌─────────────────────────────────┐
│  User: Akshat Shah              │
│                                 │
│  Email: akshat@email.com        │
│  Mobile: 9876543210             │
│  Joined: 15 Jan 2026            │
│  Status: Active                 │
│                                 │
│  Invitations: 5                 │
│  Total Guests: 1,250            │
│                                 │
│  [Disable] [Delete] [Reset PW] │
└─────────────────────────────────┘
```

---

## 9.4 Template Management

### Template List
```
┌─────────────────────────────────────────────────────┐
│  Template Management                                 │
├─────────────────────────────────────────────────────┤
│  [+ Add Template] Search: [____] Filter: [All ▼]   │
├─────────────────────────────────────────────────────┤
│  Preview │ Name │ Category │ Version │ Status │ Actions│
├─────────────────────────────────────────────────────┤
│  [img]   │Wed 01│ Wedding  │ v1.2   │Published│ ⋮   │
│  [img]   │Wed 02│ Wedding  │ v1.0   │Draft    │ ⋮   │
│  [img]   │Eng 01│Engagement│ v1.1   │Published│ ⋮   │
├─────────────────────────────────────────────────────┤
│  Showing 1-10 of 45  [< 1 2 3 ... 5 >]             │
└─────────────────────────────────────────────────────┘
```

### Template Actions
- [ ] Edit template
- [ ] Duplicate template
- [ ] Preview template
- [ ] Publish/Unpublish
- [ ] Archive
- [ ] Delete (with confirmation)
- [ ] View usage stats

### Add Template Flow
```
Step 1: Basic Info
- Template Name
- Category
- Description

Step 2: Upload Assets
- Thumbnail image
- Preview image
- Template files (HTML/CSS/JS)

Step 3: Configure
- Feature flags
- Editable fields
- Variables

Step 4: Test
- Preview in different views
- Test with sample data

Step 5: Publish
- Review and publish
```

### Template Configuration
```
┌─────────────────────────────────┐
│  Template: Wedding Template 01  │
│                                 │
│  Features:                      │
│  ☑ Multiple Events              │
│  ☑ Gallery                      │
│  ☑ Guest Personalization        │
│  ☑ Map                          │
│  ☑ Countdown                    │
│  ☐ RSVP                         │
│  ☐ Music                        │
│                                 │
│  Editable Fields:               │
│  ☑ Bride Name                   │
│  ☑ Groom Name                   │
│  ☐ Font                         │
│  ☐ Background                   │
│  ☑ Gallery                      │
│                                 │
│  [Save Configuration]           │
└─────────────────────────────────┘
```

---

## 9.5 Category Management

### Category List
```
┌─────────────────────────────────┐
│  Category Management            │
│                                 │
│  [+ Add Category]               │
│                                 │
│  ☰ Wedding (12 templates)       │
│  ☰ Engagement (3 templates)     │
│  ☰ Baby Shower (2 templates)    │
│  ☰ Birthday (4 templates)       │
│  ☰ Anniversary (2 templates)    │
│  ☰ Jain Events (1 template)     │
│  ☰ Religious Events (1 template)│
│  ☰ Housewarming (1 template)    │
│                                 │
│  [Save Order]                   │
└─────────────────────────────────┘
```

### Category Actions
- [ ] Add category
- [ ] Edit category
- [ ] Delete category (with confirmation)
- [ ] Reorder categories (drag & drop)
- [ ] Enable/Disable category

---

## 9.6 Invitation Management

### Invitation List
```
┌─────────────────────────────────────────────────────┐
│  Invitation Management                               │
├─────────────────────────────────────────────────────┤
│  Search: [________________] Filter: [All ▼]         │
├─────────────────────────────────────────────────────┤
│  Customer │ Name │ Template │ Guests │ Status │ Actions│
├─────────────────────────────────────────────────────┤
│  Akshat   │Wedd │ Wed 03   │ 245   │Published│ ⋮    │
│  Priya    │Eng  │ Eng 01   │ 150   │Draft    │ ⋮    │
│  Amit     │Bday │ Bday 02  │  50   │Published│ ⋮    │
├─────────────────────────────────────────────────────┤
│  Showing 1-20 of 3,892  [< 1 2 3 ... 195 >]        │
└─────────────────────────────────────────────────────┘
```

### Invitation Actions
- [ ] View invitation details
- [ ] Preview invitation
- [ ] View guest list
- [ ] Delete invitation (with confirmation)

---

## 9.7 Bulk WhatsApp Management

### Request List
```
┌─────────────────────────────────────────────────────┐
│  Bulk WhatsApp Requests                              │
├─────────────────────────────────────────────────────┤
│  Customer │Invitation│Recipients│Date     │Status   │
├─────────────────────────────────────────────────────┤
│  Akshat   │ Wedding  │ 500     │ 15 Feb  │Pending  │
│  Priya    │Reception │ 250     │ 20 Feb  │In Progress│
│  Amit     │Birthday  │ 100     │ 10 Feb  │Completed│
├─────────────────────────────────────────────────────┤
│  Showing 1-10 of 12  [< 1 2 >]                     │
└─────────────────────────────────────────────────────┘
```

### Request Actions
- [ ] View request details
- [ ] Contact customer
- [ ] Update status (Pending → In Progress → Completed)
- [ ] Add admin notes
- [ ] View guest list

---

## 9.8 Admin API

```
GET    /api/admin/dashboard              # Dashboard stats
GET    /api/admin/users                  # List users
GET    /api/admin/users/:id              # Get user details
PUT    /api/admin/users/:id/status       # Enable/Disable user
DELETE /api/admin/users/:id              # Delete user

GET    /api/admin/invitations            # List all invitations
GET    /api/admin/invitations/:id        # Get invitation details

GET    /api/admin/templates              # List templates
POST   /api/admin/templates              # Create template
PUT    /api/admin/templates/:id          # Update template
DELETE /api/admin/templates/:id          # Delete template
PUT    /api/admin/templates/:id/publish  # Publish template
PUT    /api/admin/templates/:id/unpublish # Unpublish template

GET    /api/admin/categories             # List categories
POST   /api/admin/categories             # Create category
PUT    /api/admin/categories/:id         # Update category
DELETE /api/admin/categories/:id         # Delete category
PUT    /api/admin/categories/reorder     # Reorder categories

GET    /api/admin/bulk-requests          # List bulk requests
PUT    /api/admin/bulk-requests/:id      # Update request status
```

---

## 9.9 Admin Security

- [ ] Admin role verification middleware
- [ ] Separate admin login
- [ ] Audit logging for admin actions
- [ ] Rate limiting on admin endpoints
- [ ] IP whitelist (optional)

---

## Deliverables

- [ ] Admin dashboard with stats
- [ ] User management (CRUD)
- [ ] Template management (CRUD)
- [ ] Category management (CRUD)
- [ ] Invitation management
- [ ] Bulk WhatsApp request management
- [ ] Admin security measures
