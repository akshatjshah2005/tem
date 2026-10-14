# Phase 03 — Template Engine

**Duration:** 3 weeks
**Goal:** Dynamic template system with JSON-based configuration and rendering

---

## 3.1 Template Architecture

### Template Structure
```json
{
  "id": "wedding-template-03",
  "name": "Wedding Template 03",
  "category": "wedding",
  "version": "1.0.0",
  "features": {
    "multipleEvents": true,
    "gallery": true,
    "guestPersonalization": true,
    "map": true,
    "countdown": true,
    "rsvp": false,
    "music": false
  },
  "variables": {
    "bride_name": { "type": "text", "required": true, "default": "" },
    "groom_name": { "type": "text", "required": true, "default": "" },
    "family_name": { "type": "text", "required": false, "default": "" },
    "wedding_date": { "type": "date", "required": true },
    "venue_name": { "type": "text", "required": true },
    "venue_address": { "type": "text", "required": false },
    "cover_image": { "type": "image", "required": false }
  },
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "editable": true,
      "elements": [
        {
          "id": "bride_name",
          "type": "text",
          "variable": "bride_name",
          "position": { "x": 50, "y": 30 },
          "style": {
            "fontSize": "48px",
            "fontFamily": "Great Vibes",
            "color": "#ffffff",
            "textAlign": "center"
          },
          "animation": "fadeInUp"
        },
        {
          "id": "ampersand",
          "type": "text",
          "value": "&",
          "position": { "x": 50, "y": 50 },
          "style": { "fontSize": "36px", "color": "#d4af37" },
          "animation": "fadeIn"
        },
        {
          "id": "groom_name",
          "type": "text",
          "variable": "groom_name",
          "position": { "x": 50, "y": 70 },
          "style": {
            "fontSize": "48px",
            "fontFamily": "Great Vibes",
            "color": "#ffffff"
          },
          "animation": "fadeInUp"
        },
        {
          "id": "background",
          "type": "image",
          "variable": "cover_image",
          "position": { "x": 0, "y": 0 },
          "size": { "width": "100%", "height": "100%" },
          "style": { "objectFit": "cover" }
        }
      ]
    },
    {
      "id": "guest_greeting",
      "type": "guest_name",
      "editable": true,
      "template": "Dear {{guest_name}}",
      "style": { "fontSize": "24px", "textAlign": "center" },
      "animation": "fadeIn"
    },
    {
      "id": "events",
      "type": "event_list",
      "editable": true,
      "layout": "cards",
      "showMap": true,
      "showCountdown": true
    },
    {
      "id": "gallery",
      "type": "gallery",
      "editable": true,
      "maxImages": 15,
      "layout": "grid",
      "columns": 3
    },
    {
      "id": "rsvp",
      "type": "rsvp",
      "editable": true,
      "fields": ["attending", "guests_count", "message"]
    }
  ]
}
```

---

## 3.2 Template Engine Core

### Renderer
```typescript
interface RenderContext {
  template: TemplateConfig;
  invitation: Invitation;
  events: Event[];
  guest?: Guest;  // For personalized view
  isPersonalized: boolean;
}

function renderInvitation(context: RenderContext): string {
  // 1. Load template config
  // 2. Merge invitation content with template variables
  // 3. Filter events based on guest assignment (if personalized)
  // 4. Replace guest-specific variables
  // 5. Render each section
  // 6. Apply animations
  // 7. Return complete HTML
}
```

### Variable Resolution
```typescript
function resolveVariables(
  template: TemplateConfig,
  content: Record<string, any>,
  guest?: Guest
): Record<string, any> {
  const resolved = { ...content };
  
  // Add guest-specific variables
  if (guest) {
    resolved.guest_name = guest.name;
    resolved.guest_mobile = guest.mobile;
  }
  
  // Add computed variables
  resolved.current_date = new Date().toISOString();
  
  return resolved;
}
```

---

## 3.3 Template Sections

### Section Types
- [ ] **Hero**: Full-screen opening with background image/video
- [ ] **Text**: Rich text content block
- [ ] **Guest Name**: Personalized guest greeting
- [ ] **Event List**: Multiple event cards with details
- [ ] **Event Card**: Single event with map, time, venue
- [ ] **Gallery**: Image grid/carousel
- [ ] **Countdown**: Auto-calculated countdown timer
- [ ] **Map**: Google Maps embed
- [ ] **RSVP**: Response form
- [ ] **Divider**: Visual separator
- [ ] **Social Links**: Social media icons
- [ ] **Custom Section**: Admin-configured custom block

---

## 3.4 Animation System

### Animation Types
```typescript
type AnimationType = 
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'slideIn'
  | 'parallax'
  | 'typewriter'
  | 'pulse'
  | 'none';

interface AnimationConfig {
  type: AnimationType;
  duration: number;  // ms
  delay: number;     // ms
  easing: string;    // CSS easing
  trigger: 'load' | 'scroll' | 'click';
}
```

### Implementation
- [ ] CSS animations (lightweight, GPU-accelerated)
- [ ] Intersection Observer for scroll-triggered animations
- [ ] Stagger animations for lists
- [ ] Respect `prefers-reduced-motion` accessibility setting
- [ ] Performance budget: animations must not drop below 60fps

---

## 3.5 Template Preview System

### Preview Modes
- [ ] Desktop preview (1920×1080)
- [ ] Tablet preview (768×1024)
- [ ] Mobile preview (375×812)
- [ ] Personalized preview (with sample guest data)

### Preview Component
```typescript
interface PreviewProps {
  template: TemplateConfig;
  content: Record<string, any>;
  events: Event[];
  mode: 'desktop' | 'tablet' | 'mobile';
  personalized?: boolean;
  sampleGuest?: Guest;
}
```

---

## 3.6 Template Storage

### Database Schema
```sql
-- Template files stored in file system or S3
-- /templates/{template-id}/
--   ├── config.json          -- Template configuration
--   ├── index.html           -- Base HTML structure
--   ├── styles.css           -- Template styles
--   ├── script.js            -- Template logic
--   ├── preview.png          -- Preview image
--   ├── thumbnail.png        -- Thumbnail
--   └── assets/
--       ├── fonts/
--       ├── images/
--       └── animations/
```

### Template Loading
```typescript
async function loadTemplate(templateId: string): Promise<TemplateConfig> {
  // 1. Check Redis cache
  // 2. If miss, load from database/filesystem
  // 3. Cache in Redis (TTL: 1 hour)
  // 4. Return config
}
```

---

## 3.7 Initial Templates (10–12)

### Wedding Templates
- [ ] Wedding Template 01 — Classic Gold
- [ ] Wedding Template 02 — Modern Minimal
- [ ] Wedding Template 03 — Floral Romance
- [ ] Wedding Template 04 — Royal Palace
- [ ] Wedding Template 05 — Destination Beach

### Other Categories
- [ ] Engagement Template 01 — Rings & Promise
- [ ] Baby Shower Template 01 — Welcome Little One
- [ ] Birthday Template 01 — Celebration
- [ ] Anniversary Template 01 — Love Story
- [ ] Jain Events Template 01 — Traditional
- [ ] Religious Events Template 01 — Divine
- [ ] Housewarming Template 01 — New Home

### Template Requirements
Each template must:
- [ ] Work on mobile, tablet, desktop
- [ ] Load in < 3 seconds on 3G
- [ ] Support guest personalization
- [ ] Support multiple events (where configured)
- [ ] Have at least 3 sections
- [ ] Include smooth animations
- [ ] Be accessible (WCAG 2.1 AA)

---

## 3.8 API Endpoints — Templates

```
GET    /api/templates                    # List templates (with filters)
GET    /api/templates/:id                # Get template config
GET    /api/templates/:id/preview        # Get template preview
POST   /api/admin/templates              # Create template (admin)
PUT    /api/admin/templates/:id          # Update template (admin)
DELETE /api/admin/templates/:id          # Delete template (admin)
PUT    /api/admin/templates/:id/publish  # Publish template (admin)
PUT    /api/admin/templates/:id/unpublish # Unpublish template (admin)
```

---

## 3.9 Performance Optimization

- [ ] Lazy load template sections
- [ ] Optimize images (WebP format, responsive sizes)
- [ ] Minimize CSS/JS bundles per template
- [ ] Use CDN for template assets
- [ ] Implement virtual scrolling for gallery
- [ ] Prefetch next section while current loads
- [ ] Service worker for offline viewing (future)

---

## Deliverables

- [ ] Template engine core working
- [ ] 10–12 initial templates
- [ ] Template preview system
- [ ] Animation system
- [ ] Template API endpoints
- [ ] Template admin CRUD
- [ ] Performance benchmarks met

---

## 3.10 Countdown Timer (Phase 13)

> **Note:** Countdown Timer features are detailed in [Phase 13 — RSVP, Analytics, Guest Groups](phase-13-rsvp-analytics.md#135-countdown-timer)

### Quick Reference
- [ ] Auto-calculate from event date
- [ ] Show days/hours/minutes/seconds
- [ ] Customizable display format
- [ ] Timezone handling
- [ ] Multiple event countdowns
- [ ] Responsive design
