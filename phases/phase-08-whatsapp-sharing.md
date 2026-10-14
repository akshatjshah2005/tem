# Phase 08 — WhatsApp Sharing

**Duration:** 1 week
**Goal:** WhatsApp sharing with personalized messages

---

## 8.1 WhatsApp Deep Links

### Link Format
```
https://api.whatsapp.com/send?text={encoded_message}
```

### Implementation
```typescript
function generateWhatsAppLink(
  mobile: string,
  message: string
): string {
  // Format mobile number (remove spaces, add country code)
  const formattedMobile = formatMobileNumber(mobile);
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Generate WhatsApp link
  return `https://api.whatsapp.com/send?phone=${formattedMobile}&text=${encodedMessage}`;
}

function formatMobileNumber(mobile: string): string {
  // Remove all non-digit characters
  let cleaned = mobile.replace(/\D/g, '');
  
  // Add country code if not present
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}
```

---

## 8.2 Message Template System

### Template Editor
```
┌─────────────────────────────────┐
│  WhatsApp Message Template      │
│                                 │
│  Message:                       │
│  ┌─────────────────────────┐   │
│  │ Dear {{guest_name}},    │   │
│  │                         │   │
│  │ We are delighted to     │   │
│  │ invite you to our       │   │
│  │ wedding celebration.    │   │
│  │                         │   │
│  │ Your personalized       │   │
│  │ invitation:             │   │
│  │ {{invitation_link}}     │   │
│  │                         │   │
│  │ With love,              │   │
│  │ {{family_name}}         │   │
│  └─────────────────────────┘   │
│                                 │
│  Available variables:           │
│  [guest_name] [invitation_link] │
│  [family_name] [event_name]    │
│                                 │
│  [Preview] [Save Template]     │
└─────────────────────────────────┘
```

### Default Template
```
Dear {{guest_name}},

You are cordially invited to {{event_name}}.

Your personalized invitation:
{{invitation_link}}

With love,
{{family_name}}
```

### Variable Replacement
```typescript
function personalizeMessage(
  template: string,
  guest: Guest,
  invitation: Invitation,
  link: string
): string {
  return template
    .replace(/\{\{guest_name\}\}/g, guest.name)
    .replace(/\{\{invitation_link\}\}/g, link)
    .replace(/\{\{family_name\}\}/g, invitation.content.family_name || '')
    .replace(/\{\{event_name\}\}/g, invitation.name);
}
```

---

## 8.3 WhatsApp Button Integration

### Individual Share Button
```typescript
// On guest row
<button onClick={() => shareOnWhatsApp(guest)}>
  WhatsApp
</button>

function shareOnWhatsApp(guest: Guest): void {
  const link = generateInvitationUrl(invitation, guest);
  const message = personalizeMessage(
    invitation.whatsapp_message_template,
    guest,
    invitation,
    link
  );
  const whatsappUrl = generateWhatsAppLink(guest.mobile, message);
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
}
```

### Message Preview Modal
```
┌─────────────────────────────────┐
│  WhatsApp Message Preview       │
│                                 │
│  Guest: Rahul Shah              │
│  Mobile: 9876543210             │
│                                 │
│  Message:                       │
│  ┌─────────────────────────┐   │
│  │ Dear Rahul,             │   │
│  │                         │   │
│  │ You are cordially       │   │
│  │ invited to Akshat       │   │
│  │ Wedding.                │   │
│  │                         │   │
│  │ Your personalized       │   │
│  │ invitation:             │   │
│  │ https://inv.me/i/akshat │   │
│  │ -wedding/a8K92LmX7z     │   │
│  │                         │   │
│  │ With love,              │   │
│  │ Shah Family             │   │
│  └─────────────────────────┘   │
│                                 │
│  [Cancel]  [Open WhatsApp]     │
└─────────────────────────────────┘
```

---

## 8.4 Bulk WhatsApp Requests

### Customer Request Form
```
┌─────────────────────────────────┐
│  Bulk WhatsApp Sending          │
│                                 │
│  Need to send to 500+ guests?   │
│  Let us handle it for you.      │
│                                 │
│  Invitation: [Akshat Wedding ▼]│
│  Recipients: 500 guests        │
│  Preferred Date: [__/__/____]   │
│  Custom Message:                │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  [Submit Request]               │
└─────────────────────────────────┘
```

### Admin Management
```
┌─────────────────────────────────┐
│  Bulk WhatsApp Requests         │
│                                 │
│  Customer │ Invitation │ Count │ Status    │ Actions │
│  ─────────┼────────────┼───────┼───────────┼─────────│
│  Akshat   │ Wedding    │ 500   │ Pending   │ View    │
│  Priya    │ Reception  │ 250   │ In Progress│ View   │
│  Amit     │ Birthday   │ 100   │ Completed │ View    │
└─────────────────────────────────┘
```

---

## 8.5 WhatsApp API

```
POST   /api/invitations/:id/whatsapp/preview     # Preview message
POST   /api/invitations/:id/whatsapp/send         # Single send (future)
POST   /api/invitations/:id/whatsapp/bulk-request  # Submit bulk request
GET    /api/admin/bulk-requests                   # List bulk requests
PUT    /api/admin/bulk-requests/:id               # Update request status
```

---

## 8.6 Mobile Optimization

### Mobile Share Flow
1. Guest clicks WhatsApp button on mobile
2. WhatsApp opens with pre-filled message
3. Guest selects contact
4. Sends message

### Desktop Share Flow
1. Guest clicks WhatsApp button on desktop
2. New tab opens WhatsApp Web
3. Message pre-filled
4. Guest scans QR code (if not logged in)
5. Sends message

---

## 8.7 Message Analytics

### Track Events
```typescript
interface WhatsAppEvent {
  guest_id: string;
  invitation_id: string;
  type: 'message_generated' | 'whatsapp_opened' | 'message_sent';
  timestamp: Date;
}
```

### Stats Dashboard
```
┌─────────────────────────────────┐
│  WhatsApp Sharing Stats         │
│                                 │
│  Messages Generated: 245        │
│  WhatsApp Opens: 200 (82%)     │
│  Estimated Sends: 180 (73%)    │
│                                 │
│  Top Shared Guests:            │
│  1. Rahul Shah - 5 shares      │
│  2. Priya Patel - 3 shares     │
└─────────────────────────────────┘
```

---

## Deliverables

- [ ] WhatsApp deep link generation
- [ ] Message template system
- [ ] Personalized message rendering
- [ ] Individual share button
- [ ] Message preview modal
- [ ] Bulk request form (customer)
- [ ] Bulk request management (admin)
- [ ] Mobile-optimized sharing flow
- [ ] Message analytics tracking
