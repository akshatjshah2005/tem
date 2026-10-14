# Phase 10 — Publishing & Security

**Duration:** 2 weeks
**Goal:** Publishing system, QR codes, and security hardening

---

## 10.1 Publishing System

### Publish Flow
```
Draft → Preview → Publish → Live
                  ↓
            Unpublish (if needed)
```

### Publish Button
```typescript
async function publishInvitation(invitationId: string): Promise<void> {
  // 1. Validate invitation completeness
  const invitation = await db.invitations.findOne({ id: invitationId });
  
  if (!invitation.template_id) {
    throw new Error('Template not selected');
  }
  
  if (!invitation.content.bride_name || !invitation.content.groom_name) {
    throw new Error('Couple names required');
  }
  
  const events = await db.events.find({ invitation_id: invitationId });
  if (events.length === 0) {
    throw new Error('At least one event required');
  }
  
  // 2. Update status
  await db.invitations.update(invitationId, {
    status: 'published',
    published_at: new Date()
  });
  
  // 3. Generate public URL
  const url = generateInvitationUrl(invitation);
  
  // 4. Log publish event
  await logEvent({
    type: 'invitation_published',
    invitation_id: invitationId,
    timestamp: new Date()
  });
}
```

### Publish Validation
- [ ] Template selected
- [ ] Couple names provided
- [ ] At least one event
- [ ] Event dates valid
- [ ] No critical errors

### Unpublish
```typescript
async function unpublishInvitation(invitationId: string): Promise<void> {
  await db.invitations.update(invitationId, {
    status: 'unpublished'
  });
  
  // Existing personalized links stop working
  // Common link returns "Not available" page
}
```

---

## 10.2 Public Invitation Pages

### Common View
```
/i/{slug}

Example: /i/akshat-wedding
```

### Personalized View
```
/i/{slug}/{token}

Example: /i/akshat-wedding/a8K92LmX7z
```

### Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akshat & Priya Wedding</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="Akshat & Priya Wedding">
  <meta property="og:description" content="You are cordially invited">
  <meta property="og:image" content="https://inv.me/og/akshat-wedding">
  <meta property="og:url" content="https://inv.me/i/akshat-wedding">
  
  <!-- Noindex for personalized pages -->
  <meta name="robots" content="noindex">
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/fonts/great-vibes.woff2" as="font">
  <link rel="preload" href="/css/template-wedding-03.css" as="style">
</head>
<body>
  <!-- Rendered invitation -->
  <div id="invitation">
    <!-- Sections rendered here -->
  </div>
  
  <!-- Scripts -->
  <script src="/js/animations.js"></script>
  <script src="/js/countdown.js"></script>
</body>
</html>
```

---

## 10.3 QR Code Generation

### QR Code API
```typescript
import QRCode from 'qrcode';

async function generateQRCode(
  url: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: options?.width || 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}
```

### QR Code Endpoints
```
GET /api/invitations/:id/qr              # Common invitation QR
GET /api/invitations/:id/guests/:guestId/qr # Personalized QR
```

### QR Code Display
```
┌─────────────────────────────────┐
│  Download QR Code               │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      [QR Code]          │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Size: [300px ▼]               │
│                                 │
│  [Download PNG] [Download SVG]  │
└─────────────────────────────────┘
```

### QR Code Usage
- [ ] Common invitation QR
- [ ] Personalized guest QR
- [ ] Download for print
- [ ] Multiple sizes (300px, 500px, 1000px)
- [ ] SVG format for print

---

## 10.4 Security Implementation

### Authentication Security
- [ ] Password hashing (bcrypt, 12 rounds)
- [ ] JWT with short expiry (7 days)
- [ ] Refresh token rotation
- [ ] Account lockout (5 failed attempts)
- [ ] Rate limiting on auth endpoints

### API Security
- [ ] CORS configuration
- [ ] Helmet.js headers
- [ ] Rate limiting (100 req/min per IP)
- [ ] Input validation (Joi/Zod)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection

### File Upload Security
- [ ] File type validation (whitelist)
- [ ] File size limits (5MB)
- [ ] Virus scanning (optional)
- [ ] Rename uploaded files
- [ ] Store outside webroot
- [ ] Generate signed URLs

### Token Security
- [ ] Cryptographically random tokens
- [ ] No sequential/predictable patterns
- [ ] Tokens not logged
- [ ] HTTPS only
- [ ] Token rotation (optional)

### Data Security
- [ ] Encrypt sensitive data at rest
- [ ] HTTPS in transit
- [ ] No sensitive data in URLs
- [ ] Anonymize IP addresses in logs
- [ ] GDPR compliance (future)

---

## 10.5 Rate Limiting

### Limits
```typescript
const rateLimits = {
  auth: {
    login: { windowMs: 15 * 60 * 1000, max: 10 },
    register: { windowMs: 60 * 60 * 1000, max: 5 }
  },
  api: {
    default: { windowMs: 60 * 1000, max: 100 },
    upload: { windowMs: 60 * 1000, max: 20 }
  },
  invitation: {
    view: { windowMs: 60 * 1000, max: 60 }
  }
};
```

### Implementation
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

---

## 10.6 Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
// Adds headers:
// - Content-Security-Policy
// - X-Content-Type-Options
// - X-Frame-Options
// - X-XSS-Protection
// - Strict-Transport-Security
// - Referrer-Policy
// - Permissions-Policy
```

---

## 10.7 Input Validation

### Schema Validation
```typescript
import { z } from 'zod';

const CreateGuestSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional(),
  events: z.array(z.string().uuid()).min(1)
});

// Middleware
function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues
      });
    }
    req.body = result.data;
    next();
  };
}
```

---

## 10.8 Audit Logging

### Log Events
```typescript
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}
```

### Events to Log
- [ ] User login/logout
- [ ] Invitation created/updated/deleted
- [ ] Invitation published/unpublished
- [ ] Guest added/updated/deleted
- [ ] Template created/updated/published
- [ ] Bulk request created/updated
- [ ] Admin actions

---

## 10.9 Invitation Expiration

### Expiration Logic
```typescript
async function checkExpiration(invitation: Invitation): Promise<boolean> {
  if (!invitation.expires_at) {
    return false; // No expiration set
  }
  
  return new Date() > invitation.expires_at;
}
```

### Expired Page
```
┌─────────────────────────────────┐
│                                 │
│  This invitation is no longer   │
│  available.                     │
│                                 │
│  The event has passed or the    │
│  invitation has expired.        │
│                                 │
│  Contact the organizer for     │
│  more information.              │
│                                 │
└─────────────────────────────────┘
```

---

## 10.10 Error Pages

### 404 — Not Found
```
This invitation could not be found.
Please check the link and try again.
```

### 403 — Not Published
```
This invitation is not yet published.
Please check back later.
```

### 410 — Expired
```
This invitation is no longer available.
```

### 500 — Server Error
```
Something went wrong.
Please try again later.
```

---

## Deliverables

- [ ] Publishing system (publish/unpublish)
- [ ] Public invitation pages
- [ ] QR code generation
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Input validation
- [ ] Audit logging
- [ ] Error pages
- [ ] Invitation expiration

---

## 10.11 QR Codes (Phase 13)

> **Note:** QR Code features are detailed in [Phase 13 — RSVP, Analytics, Guest Groups](phase-13-rsvp-analytics.md#134-qr-codes)

### Quick Reference
- [ ] Generate QR for common invitation
- [ ] Generate QR for each guest (personalized)
- [ ] Download QR (PNG/SVG)
- [ ] Multiple sizes for print
- [ ] Print-ready QR sheets
- [ ] Custom QR with logo overlay
