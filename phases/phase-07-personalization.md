# Phase 07 — Personalization Engine

**Duration:** 2 weeks
**Goal:** Unique token system, dynamic URL generation, and guest name rendering

---

## 7.1 Token Generation System

### Token Requirements
- [ ] Random, unpredictable tokens
- [ ] URL-safe characters only
- [ ] 8–12 characters length
- [ ] No sensitive data exposure
- [ ] Unique per guest

### Token Format
```
Characters: a-z, A-Z, 0-9, -, _
Length: 10 characters
Example: a8K92LmX7z
```

### Generation Algorithm
```typescript
import { randomBytes } from 'crypto';

function generatePersonalToken(): string {
  // Generate 8 random bytes (64 bits of entropy)
  const bytes = randomBytes(8);
  
  // Convert to URL-safe base64
  const token = bytes
    .toString('base64url')
    .replace(/[=]/g, '')
    .substring(0, 10);
  
  return token;
}

// Collision check
async function ensureUniqueToken(): Promise<string> {
  let token: string;
  let exists: boolean;
  
  do {
    token = generatePersonalToken();
    exists = await db.guests.exists({ personal_token: token });
  } while (exists);
  
  return token;
}
```

### Token Storage
```sql
-- Unique constraint on personal_token
ALTER TABLE guests ADD CONSTRAINT unique_personal_token 
  UNIQUE (personal_token);

-- Index for fast lookup
CREATE INDEX idx_guests_personal_token ON guests(personal_token);
```

---

## 7.2 URL Generation

### URL Structure
```
Common:    /i/{invitation-slug}
Personal:  /i/{invitation-slug}/{token}
```

### Examples
```
Common:    /i/akshat-wedding
Personal:  /i/akshat-wedding/a8K92LmX7z
```

### URL Generation
```typescript
function generateInvitationUrl(
  invitation: Invitation,
  guest?: Guest,
  baseUrl: string = process.env.APP_URL
): string {
  const slug = invitation.slug;
  
  if (!guest || !invitation.is_personalized) {
    return `${baseUrl}/i/${slug}`;
  }
  
  return `${baseUrl}/i/${slug}/${guest.personal_token}`;
}
```

### Link Regeneration
- [ ] Regenerate token for guest
- [ ] Invalidate old token
- [ ] Update guest record
- [ ] Log regeneration event

---

## 7.3 Invitation Access Flow

### Route Handler
```
GET /i/:slug/:token?
```

### Access Logic
```typescript
async function handleInvitationAccess(
  req: Request,
  res: Response
): Promise<void> {
  const { slug, token } = req.params;
  
  // 1. Find invitation by slug
  const invitation = await db.invitations.findOne({ slug });
  if (!invitation) {
    return res.status(404).render('invitation-not-found');
  }
  
  // 2. Check if published
  if (invitation.status !== 'published') {
    return res.status(403).render('invitation-not-published');
  }
  
  // 3. Check expiration
  if (invitation.expires_at && invitation.expires_at < new Date()) {
    return res.status(410).render('invitation-expired');
  }
  
  // 4. If token provided, find guest
  let guest: Guest | null = null;
  if (token) {
    guest = await db.guests.findOne({ personal_token: token });
    if (!guest) {
      return res.status(404).render('invalid-link');
    }
    
    // 5. Update guest stats
    await db.guests.update(guest.id, {
      status: 'opened',
      opened_at: guest.opened_at || new Date(),
      last_accessed_at: new Date()
    });
  }
  
  // 6. Get events (filtered for personalized view)
  let events = await db.events.find({ invitation_id: invitation.id });
  if (guest) {
    const guestEventIds = await db.guest_events.find({ guest_id: guest.id });
    const allowedEventIds = new Set(ge.event_id for ge of guestEventIds);
    events = events.filter(e => allowedEventIds.has(e.id));
  }
  
  // 7. Get media
  const media = await db.media.find({ invitation_id: invitation.id });
  
  // 8. Render invitation
  const html = renderInvitation({
    template: await loadTemplate(invitation.template_id),
    invitation,
    events,
    guest,
    media,
    isPersonalized: !!guest
  });
  
  // 9. Set appropriate headers
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'X-Robots-Tag': 'noindex'  // Don't index personalized pages
  });
  
  return res.send(html);
}
```

---

## 7.4 Dynamic Variable Rendering

### Variable Types
```typescript
type VariableType = 
  | 'text'        // Plain text
  | 'html'        // HTML content
  | 'date'        // Formatted date
  | 'time'        // Formatted time
  | 'datetime'    // Formatted datetime
  | 'image'       // Image URL
  | 'guest_name'  // Guest name (special handling)
  | 'guest_first' // Guest first name
  | 'guest_full'; // Guest full name with title
```

### Variable Resolution
```typescript
function resolveVariable(
  type: VariableType,
  value: any,
  guest?: Guest,
  locale: string = 'en-IN'
): string {
  switch (type) {
    case 'text':
      return escapeHtml(String(value));
    
    case 'date':
      return formatDate(value, locale);
    
    case 'time':
      return formatTime(value, locale);
    
    case 'guest_name':
      return guest ? escapeHtml(guest.name) : 'Guest';
    
    case 'guest_first':
      return guest ? escapeHtml(guest.name.split(' ')[0]) : 'Guest';
    
    case 'guest_full':
      return guest ? escapeHtml(`Dear ${guest.name}`) : 'Dear Guest';
    
    case 'image':
      return getOptimizedUrl(value);
    
    default:
      return String(value);
  }
}
```

### Template Rendering
```typescript
function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  // Replace {{variable_name}} with resolved values
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, varName) => {
      const value = variables[varName];
      return value !== undefined ? value : match;
    }
  );
}
```

---

## 7.5 Guest Name Display

### Display Styles
```typescript
type GuestNameStyle = 
  | 'dear_name'      // "Dear Rahul"
  | 'name_family'    // "Rahul & Family"
  | 'name_and_family' // "Rahul and Family"
  | 'welcome_name'   // "Welcome, Rahul"
  | 'custom';        // Custom template
```

### Template Integration
```html
<!-- In template config -->
{
  "id": "guest_greeting",
  "type": "guest_name",
  "style": "dear_name",
  "template": "Dear {{guest_first_name}},",
  "animation": "fadeIn"
}

<!-- Rendered output -->
<p class="guest-greeting" data-animation="fadeIn">
  Dear Rahul,
</p>
```

---

## 7.6 Event Filtering

### Personalized Event Display
```typescript
function getPersonalizedEvents(
  allEvents: Event[],
  guest: Guest,
  guestEvents: GuestEvent[]
): Event[] {
  const allowedEventIds = new Set(
    guestEvents.map(ge => ge.event_id)
  );
  
  return allEvents.filter(event => 
    allowedEventIds.has(event.id)
  );
}
```

### No Events Assigned
- [ ] Show fallback message: "No events assigned yet"
- [ ] Show contact information
- [ ] Don't show empty event section

---

## 7.7 Analytics Tracking

### Track Events
```typescript
// When guest opens invitation
await trackEvent({
  type: 'invitation_opened',
  guest_id: guest.id,
  invitation_id: invitation.id,
  token: guest.personal_token,
  user_agent: req.headers['user-agent'],
  ip: anonymizeIp(req.ip),
  timestamp: new Date()
});

// When guest clicks RSVP
await trackEvent({
  type: 'rsvp_submitted',
  guest_id: guest.id,
  invitation_id: invitation.id,
  response: 'attending',
  timestamp: new Date()
});
```

### Stats Update
```typescript
// Update guest status
await db.guests.update(guest.id, {
  status: 'opened',
  opened_at: guest.opened_at || new Date(),
  last_accessed_at: new Date()
});

// Update invitation views
await db.invitations.update(invitation.id, {
  views: invitation.views + 1
});
```

---

## 7.8 Security Measures

### Token Security
- [ ] Tokens are cryptographically random
- [ ] No sequential or predictable patterns
- [ ] Tokens are not logged in server logs
- [ ] Tokens not exposed in URLs (use HTTPS)
- [ ] Rate limiting on token validation

### Access Control
- [ ] Only published invitations are accessible
- [ ] Expired invitations return 410 Gone
- [ ] Invalid tokens return 404
- [ ] Noindex meta tag for personalized pages

### Privacy
- [ ] Guest data not exposed in URL
- [ ] IP addresses anonymized in logs
- [ ] No third-party tracking on invitation pages
- [ ] HTTPS enforced

---

## 7.9 API Endpoints

```
GET    /i/:slug                          # Common invitation view
GET    /i/:slug/:token                   # Personalized invitation view
POST   /api/invitations/:id/generate-links # Generate all personalized links
GET    /api/invitations/:id/guests/:guestId/link # Get guest's link
POST   /api/invitations/:id/guests/:guestId/regenerate-link # Regenerate link
GET    /api/invitations/:id/stats         # Get invitation statistics
```

---

## Deliverables

- [ ] Token generation system
- [ ] URL generation (common + personalized)
- [ ] Invitation access flow
- [ ] Dynamic variable rendering
- [ ] Guest name display
- [ ] Event filtering for personalized view
- [ ] Analytics tracking
- [ ] Security measures implemented
