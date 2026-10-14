# Phase 05 — Events & Media

**Duration:** 2 weeks
**Goal:** Multiple event system and media upload/management

---

## 5.1 Event Management

### Add Event Form
```
┌─────────────────────────────────┐
│  Add New Event                  │
│                                 │
│  Event Name *                   │
│  [________________________]     │
│  e.g., "Haldi Ceremony"        │
│                                 │
│  Date *                         │
│  [__/__/____]                   │
│                                 │
│  Start Time                     │
│  [__:__ AM/PM]                  │
│                                 │
│  End Time                       │
│  [__:__ AM/PM]                  │
│                                 │
│  Venue Name                     │
│  [________________________]     │
│                                 │
│  Venue Address                  │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  Map Location                   │
│  [Open Map Picker]              │
│                                 │
│  Description                    │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  Dress Code                     │
│  [________________________]     │
│                                 │
│  Event Image                    │
│  [Upload Image]                 │
│                                 │
│  [Cancel]              [Save]   │
└─────────────────────────────────┘
```

### Event Validation
- [ ] Name: required, 2–100 chars
- [ ] Date: required, must be future date
- [ ] Start time: optional, must be before end time
- [ ] End time: optional, must be after start time
- [ ] Venue: optional
- [ ] Image: optional, max 5MB, JPG/PNG/WebP

### Event Actions
- [ ] Edit event (modal form)
- [ ] Delete event (with confirmation)
- [ ] Reorder events (drag & drop)
- [ ] Duplicate event

### Event API
```
POST   /api/invitations/:id/events           # Add event
GET    /api/invitations/:id/events           # List events
GET    /api/invitations/:id/events/:eventId  # Get event
PUT    /api/invitations/:id/events/:eventId  # Update event
DELETE /api/invitations/:id/events/:eventId  # Delete event
PUT    /api/invitations/:id/events/reorder   # Reorder events
```

---

## 5.2 Media Upload System

### Upload Component
```
┌─────────────────────────────────┐
│  Upload Images                  │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   Drag & drop images    │   │
│  │   or                    │   │
│  │   [Browse Files]        │   │
│  │                         │   │
│  │   JPG, PNG, WebP        │   │
│  │   Max 5MB each          │   │
│  └─────────────────────────┘   │
│                                 │
│  Uploaded: 3/15 images         │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐            │
│  │   │ │   │ │   │            │
│  │ 1 │ │ 2 │ │ 3 │            │
│  └───┘ └───┘ └───┘            │
└─────────────────────────────────┘
```

### Upload Features
- [ ] Drag & drop upload
- [ ] File browser fallback
- [ ] Multiple file selection
- [ ] Upload progress indicator
- [ ] Image preview before upload
- [ ] Cancel upload
- [ ] Retry failed upload

### Image Processing
- [ ] Validate file type (JPG, PNG, WebP)
- [ ] Validate file size (max 5MB)
- [ ] Compress image (quality 85%)
- [ ] Generate thumbnails (150×150, 300×300)
- [ ] Generate optimized versions (800w, 1200w, 1920w)
- [ ] Convert to WebP (with JPEG fallback)
- [ ] Strip EXIF data (privacy)

### Storage Strategy
```
/invitations/{invitation-id}/
├── original/{filename}.jpg
├── optimized/{filename}-800w.webp
├── optimized/{filename}-1200w.webp
├── optimized/{filename}-1920w.webp
├── thumbnail/{filename}-150w.webp
└── thumbnail/{filename}-300w.webp
```

---

## 5.3 Gallery Management

### Gallery Component
```
┌─────────────────────────────────┐
│  Photo Gallery (3/15)           │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐            │
│  │   │ │   │ │   │            │
│  │ 1 │ │ 2 │ │ 3 │            │
│  │ ✕ │ │ ✕ │ │ ✕ │            │
│  └───┘ └───┘ └───┘            │
│                                 │
│  [Upload More]                  │
│                                 │
│  Drag to reorder                │
└─────────────────────────────────┘
```

### Gallery Features
- [ ] Image grid display
- [ ] Drag to reorder
- [ ] Delete image (with confirmation)
- [ ] Set as cover image
- [ ] Image count display
- [ ] Max image limit enforcement

### Gallery API
```
POST   /api/invitations/:id/gallery           # Upload to gallery
DELETE /api/invitations/:id/gallery/:mediaId  # Remove from gallery
PUT    /api/invitations/:id/gallery/reorder   # Reorder gallery
PUT    /api/invitations/:id/gallery/:mediaId/cover # Set cover
```

---

## 5.4 Media API

```
POST   /api/media/upload              # Upload file
POST   /api/media/upload-batch        # Batch upload
GET    /api/media/:id                 # Get media details
DELETE /api/media/:id                 # Delete media
GET    /api/media/:id/optimized       # Get optimized URL
GET    /api/media/:id/thumbnail       # Get thumbnail URL
```

---

## 5.5 Map Integration

### Map Picker
- [ ] Google Maps embed
- [ ] Search location
- [ ] Click to pin
- [ ] Drag pin to adjust
- [ ] Auto-fill address from pin
- [ ] Store lat/lng coordinates

### Map Display
- [ ] Static map image (for loading)
- [ ] Interactive map (on click)
- [ ] "Open in Google Maps" button
- [ ] "Open in Apple Maps" button

---

## 5.6 Image Optimization

### Optimization Pipeline
```
Original Upload → Validate → Compress → Generate Variants → Store
```

### Quality Settings
| Variant | Width | Quality | Format |
|---------|-------|---------|--------|
| Original | Keep | 85% | Keep |
| Large | 1920px | 80% | WebP |
| Medium | 1200px | 80% | WebP |
| Small | 800px | 75% | WebP |
| Thumbnail | 300px | 70% | WebP |
| Tiny | 150px | 60% | WebP |

### Responsive Images
```html
<img 
  srcset="
    /image-150w.webp 150w,
    /image-300w.webp 300w,
    /image-800w.webp 800w,
    /image-1200w.webp 1200w,
    /image-1920w.webp 1920w
  "
  sizes="(max-width: 375px) 100vw, (max-width: 768px) 50vw, 33vw"
  src="/image-800w.webp"
  alt="Wedding photo"
  loading="lazy"
/>
```

---

## Deliverables

- [ ] Add/edit/delete events
- [ ] Event reordering
- [ ] Image upload with drag & drop
- [ ] Image optimization pipeline
- [ ] Gallery management
- [ ] Map picker integration
- [ ] Responsive image delivery
- [ ] File validation and error handling

---

## 5.7 Advanced Gallery (Phase 13)

> **Note:** Advanced Gallery features are detailed in [Phase 13 — RSVP, Analytics, Guest Groups](phase-13-rsvp-analytics.md#136-advanced-gallery)

### Quick Reference
- [ ] Lightbox view with navigation
- [ ] Image captions
- [ ] Slideshow mode (auto-play)
- [ ] Video support
- [ ] Image compression options
- [ ] Multiple gallery layouts (grid, masonry, carousel)
