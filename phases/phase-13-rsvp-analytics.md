# Phase 13 — RSVP, Analytics, Guest Groups, QR, Countdown & Advanced Gallery

**Duration:** 3 weeks
**Goal:** Enhanced guest interaction, analytics, and advanced media features

---

## 13.1 RSVP System

### RSVP Button on Invitation
```html
<!-- Added to invitation template -->
<section class="rsvp-section" id="rsvp">
  <h2>RSVP</h2>
  <p>We would love to hear from you!</p>
  
  <form id="rsvp-form">
    <div class="rsvp-buttons">
      <button type="button" class="btn-accept" data-response="accept">
        ✓ Accept with Pleasure
      </button>
      <button type="button" class="btn-decline" data-response="decline">
        ✗ Decline with Regret
      </button>
    </div>
    
    <div class="rsvp-details" style="display: none;">
      <label>Number of Guests</label>
      <input type="number" name="guests_count" min="1" max="10" value="1">
      
      <label>Dietary Requirements</label>
      <textarea name="dietary" placeholder="Any dietary requirements..."></textarea>
      
      <label>Message for the Couple</label>
      <textarea name="message" placeholder="Your wishes..."></textarea>
      
      <button type="submit">Submit RSVP</button>
    </div>
  </form>
</section>
```

### RSVP API Endpoints
```
POST   /api/invitations/:id/rsvp                 # Submit RSVP (public)
GET    /api/invitations/:id/rsvp                  # Get RSVP stats (owner)
GET    /api/invitations/:id/rsvp/list             # Get all RSVPs (owner)
PUT    /api/invitations/:id/rsvp/:guestId         # Update RSVP
DELETE /api/invitations/:id/rsvp/:guestId         # Cancel RSVP
GET    /api/invitations/:id/rsvp/export           # Export RSVP list
```

### RSVP Database Schema
```sql
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    
    response VARCHAR(20) CHECK (response IN ('pending', 'accept', 'decline')),
    guests_count INTEGER DEFAULT 1,
    dietary TEXT,
    message TEXT,
    
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(guest_id, invitation_id)
);
```

### RSVP Response Flow
```
Guest opens invitation
        ↓
Clicks RSVP button
        ↓
Selects Accept/Decline
        ↓
Fills additional details (optional)
        ↓
Submits form
        ↓
System updates RSVP status
        ↓
Customer notified (optional)
```

### RSVP Dashboard (Customer View)
```
┌─────────────────────────────────────────────────────┐
│  RSVP Dashboard — Akshat Wedding                    │
├─────────────────────────────────────────────────────┤
│  Total Invited: 245                                 │
│  Responded: 180 (73%)                               │
│  Pending: 65 (27%)                                  │
├─────────────────────────────────────────────────────┤
│  ✓ Accepted: 150 (83%)    │  ✗ Declined: 30 (17%) │
├─────────────────────────────────────────────────────┤
│  Total Attending: 285 guests (with +1s)             │
├─────────────────────────────────────────────────────┤
│  Recent Responses:                                  │
│  ┌──────────────┬──────────┬─────────┬──────────┐  │
│  │ Guest        │ Response │ Guests  │ Message  │  │
│  ├──────────────┼──────────┼─────────┼──────────┤  │
│  │ Rahul Shah   │ ✓ Accept │   2     │ Best...  │  │
│  │ Priya Patel  │ ✓ Accept │   1     │ Congrats │  │
│  │ Amit Mehta   │ ✗ Decline│   0     │ Sorry... │  │
│  └──────────────┴──────────┴─────────┴──────────┘  │
│                                                     │
│  [Export RSVP List]  [Send Reminder]                │
└─────────────────────────────────────────────────────┘
```

### RSVP Notifications
```typescript
// Notify customer when RSVP received
async function notifyRSVP(rsvp: RSVP, invitation: Invitation): Promise<void> {
  // In-app notification
  await db.notifications.create({
    user_id: invitation.user_id,
    type: 'rsvp_received',
    title: 'New RSVP Response',
    message: `${rsvp.guest.name} has responded to ${invitation.name}`,
    data: { rsvp_id: rsvp.id, invitation_id: invitation.id }
  });
  
  // Email notification (optional)
  if (invitation.user.notification_preferences.email_rsvp) {
    await sendEmail({
      to: invitation.user.email,
      subject: `New RSVP for ${invitation.name}`,
      template: 'rsvp-notification',
      data: { guest_name: rsvp.guest.name, response: rsvp.response }
    });
  }
}
```

### RSVP Styling
```css
.rsvp-section {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.rsvp-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 30px 0;
}

.btn-accept, .btn-decline {
  padding: 15px 40px;
  font-size: 18px;
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accept {
  background: white;
  color: #667eea;
}

.btn-decline {
  background: transparent;
  color: white;
}

.btn-accept:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.btn-decline:hover {
  background: rgba(255,255,255,0.1);
}
```

---

## 13.2 Analytics Dashboard

### Analytics Data Collection
```typescript
// Track invitation events
interface AnalyticsEvent {
  invitation_id: string;
  guest_id?: string;
  event_type: 'view' | 'link_open' | 'rsvp' | 'share' | 'scroll' | 'time_spent';
  data: {
    duration?: number;
    device?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
    referrer?: string;
    screen_width?: number;
    screen_height?: number;
  };
  timestamp: Date;
}

// Collect analytics
async function trackAnalytics(event: AnalyticsEvent): Promise<void> {
  await db.analytics.create(event);
}
```

### Analytics Database Schema
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    
    event_type VARCHAR(50) NOT NULL,
    
    -- Device info
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_width INTEGER,
    screen_height INTEGER,
    
    -- Location info
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Session info
    referrer TEXT,
    duration INTEGER,  -- seconds
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_analytics_invitation ON analytics(invitation_id);
CREATE INDEX idx_analytics_type ON analytics(event_type);
CREATE INDEX idx_analytics_created ON analytics(created_at);
```

### Analytics API Endpoints
```
POST   /api/analytics/track              # Track event (public)
GET    /api/invitations/:id/analytics     # Get invitation analytics
GET    /api/invitations/:id/analytics/summary  # Get summary
GET    /api/invitations/:id/analytics/timeline # Get timeline
GET    /api/invitations/:id/analytics/export    # Export analytics
```

### Analytics Dashboard (Customer View)
```
┌─────────────────────────────────────────────────────┐
│  Analytics — Akshat Wedding                         │
├─────────────────────────────────────────────────────┤
│  Overview                                           │
│  ┌─────────┬─────────┬─────────┬─────────┐         │
│  │  Views  │  Links  │  RSVPs  │  Shares │         │
│  │  1,245  │   245   │   180   │    89   │         │
│  │  ↑ 12%  │  ↑ 5%   │  ↑ 8%   │  ↑ 15%  │         │
│  └─────────┴─────────┴─────────┴─────────┘         │
├─────────────────────────────────────────────────────┤
│  Device Breakdown                                   │
│  ┌─────────────────────────────────────────┐       │
│  │  Mobile:  65%  ████████████████         │       │
│  │  Desktop: 30%  ████████                 │       │
│  │  Tablet:   5%  █                        │       │
│  └─────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────┤
│  Top Referrers                                      │
│  1. WhatsApp — 180 (73%)                           │
│  2. Direct — 45 (18%)                              │
│  3. Instagram — 12 (5%)                            │
│  4. Facebook — 8 (3%)                              │
├─────────────────────────────────────────────────────┤
│  Geographic Distribution                            │
│  ┌─────────────────────────────────────────┐       │
│  │  Mumbai:      89 (36%)                  │       │
│  │  Delhi:       45 (18%)                  │       │
│  │  Bangalore:   32 (13%)                  │       │
│  │  Ahmedabad:   28 (11%)                  │       │
│  │  Others:      51 (22%)                  │       │
│  └─────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────┤
│  Timeline (Last 7 Days)                             │
│  ┌─────────────────────────────────────────┐       │
│  │      *                                  │       │
│  │     * *        *                        │       │
│  │    *   *      * *                       │       │
│  │   *     *    *   *                      │       │
│  │  *       *  *     *                     │       │
│  │ *         **       *                    │       │
│  │─────────────────────────────            │       │
│  │ Mon Tue Wed Thu Fri Sat Sun             │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  [Export Data]  [Share Report]                      │
└─────────────────────────────────────────────────────┘
```

### Analytics Summary Query
```typescript
async function getAnalyticsSummary(invitationId: string): Promise<AnalyticsSummary> {
  const [views, links, rsvps, shares, devices, locations] = await Promise.all([
    // Total views
    db.analytics.count({
      invitation_id: invitationId,
      event_type: 'view'
    }),
    
    // Unique link opens
    db.analytics.countDistinct('guest_id', {
      invitation_id: invitationId,
      event_type: 'link_open'
    }),
    
    // RSVP responses
    db.rsvps.count({
      invitation_id: invitationId,
      response: { $ne: 'pending' }
    }),
    
    // WhatsApp shares
    db.analytics.count({
      invitation_id: invitationId,
      event_type: 'share',
      data: { platform: 'whatsapp' }
    }),
    
    // Device breakdown
    db.analytics.groupBy('device_type', {
      invitation_id: invitationId,
      event_type: 'view'
    }),
    
    // Location breakdown
    db.analytics.groupBy('country', {
      invitation_id: invitationId,
      event_type: 'view'
    })
  ]);
  
  return {
    views,
    links,
    rsvps,
    shares,
    devices,
    locations
  };
}
```

### Time Spent Tracking
```typescript
// Frontend tracking
let startTime: number;
let totalTime: number = 0;

function startTracking(): void {
  startTime = Date.now();
  
  // Track page visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      totalTime += Date.now() - startTime;
      trackEvent({
        type: 'time_spent',
        duration: Math.floor(totalTime / 1000)
      });
    } else {
      startTime = Date.now();
    }
  });
}

// Send heartbeat every 30 seconds
setInterval(() => {
  if (!document.hidden) {
    const currentDuration = Math.floor((Date.now() - startTime) / 1000);
    trackEvent({
      type: 'heartbeat',
      duration: currentDuration
    });
  }
}, 30000);
```

---

## 13.3 Guest Groups

### Group Management UI
```
┌─────────────────────────────────────────────────────┐
│  Guest Groups — Akshat Wedding                      │
├─────────────────────────────────────────────────────┤
│  [+ Create Group]                                   │
├─────────────────────────────────────────────────────┤
│  Group Name     │ Members │ Events     │ Actions    │
├─────────────────────────────────────────────────────┤
│  Family         │   45    │ All        │ ⋮         │
│  Friends        │   80    │ Sangeet, Wedding │ ⋮  │
│  Office         │   35    │ Wedding, Reception │ ⋮ │
│  Jain Sangh     │   60    │ All        │ ⋮         │
│  Neighbours     │   25    │ Wedding    │ ⋮         │
│  VIP            │   10    │ All        │ ⋮         │
└─────────────────────────────────────────────────────┘
```

### Group Database Schema
```sql
CREATE TABLE guest_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- For UI display
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(invitation_id, name)
);

-- Add group_id to guests table
ALTER TABLE guests ADD COLUMN group_id UUID REFERENCES guest_groups(id);
```

### Group API Endpoints
```
POST   /api/invitations/:id/groups           # Create group
GET    /api/invitations/:id/groups            # List groups
PUT    /api/invitations/:id/groups/:groupId   # Update group
DELETE /api/invitations/:id/groups/:groupId   # Delete group
PUT    /api/invitations/:id/groups/reorder    # Reorder groups

POST   /api/invitations/:id/groups/:groupId/assign   # Assign guests to group
DELETE /api/invitations/:id/groups/:groupId/assign/:guestId  # Remove from group
POST   /api/invitations/:id/groups/:groupId/events    # Assign events to group
```

### Bulk Group Assignment
```typescript
// Assign multiple guests to a group
async function assignGuestsToGroup(
  groupId: string,
  guestIds: string[]
): Promise<void> {
  await db.guests.updateMany(
    { id: { $in: guestIds } },
    { group_id: groupId }
  );
}

// Assign events to all guests in a group
async function assignEventsToGroup(
  groupId: string,
  eventIds: string[]
): Promise<void> {
  const guests = await db.guests.find({ group_id: groupId });
  
  for (const guest of guests) {
    for (const eventId of eventIds) {
      await db.guest_events.upsert({
        guest_id: guest.id,
        event_id: eventId
      });
    }
  }
}
```

### Group Filter in Guest List
```typescript
// Filter guests by group
async function getGuestsByGroup(
  invitationId: string,
  groupId?: string
): Promise<Guest[]> {
  const filter: any = { invitation_id: invitationId };
  
  if (groupId) {
    filter.group_id = groupId;
  }
  
  return db.guests.find(filter);
}
```

### Group UI Components
```typescript
// Group selector component
function GroupSelector({ groups, onSelect, selectedGroup }) {
  return (
    <div className="group-selector">
      <select 
        value={selectedGroup?.id || ''} 
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">All Guests</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>
            {group.name} ({group.member_count})
          </option>
        ))}
      </select>
    </div>
  );
}

// Group badges component
function GroupBadges({ groups }) {
  return (
    <div className="group-badges">
      {groups.map(group => (
        <span 
          key={group.id} 
          className="badge"
          style={{ backgroundColor: group.color }}
        >
          {group.name}
        </span>
      ))}
    </div>
  );
}
```

---

## 13.4 QR Codes

### QR Code Generation
```typescript
import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

async function generateQRCode(
  url: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: options.width || 300,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#ffffff'
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'M'
  });
}

// Generate SVG
async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    width: options.width || 300,
    margin: options.margin || 2
  });
}
```

### QR Code API Endpoints
```
GET    /api/invitations/:id/qr                    # Common invitation QR
GET    /api/invitations/:id/qr?size=500           # QR with custom size
GET    /api/invitations/:id/guests/:guestId/qr    # Personalized QR
GET    /api/invitations/:id/qr/download           # Download QR (PNG)
GET    /api/invitations/:id/qr/svg                # Download QR (SVG)
GET    /api/invitations/:id/qr/print              # Print-ready QR sheet
```

### QR Code Display Component
```typescript
function QRCodeDisplay({ url, size, downloadable }) {
  const [qrUrl, setQrUrl] = useState('');
  
  useEffect(() => {
    // Generate QR code URL
    const apiUrl = `/api/qr?url=${encodeURIComponent(url)}&size=${size}`;
    setQrUrl(apiUrl);
  }, [url, size]);
  
  return (
    <div className="qr-code-display">
      <img src={qrUrl} alt="QR Code" width={size} height={size} />
      
      {downloadable && (
        <div className="qr-actions">
          <a href={`${qrUrl}&format=png`} download>
            Download PNG
          </a>
          <a href={`${qrUrl}&format=svg`} download>
            Download SVG
          </a>
        </div>
      )}
    </div>
  );
}
```

### Print-Ready QR Sheet
```typescript
// Generate printable QR sheet (A4)
async function generatePrintSheet(
  qrCodes: { url: string; label: string }[],
  options: {
    columns?: number;
    rows?: number;
    qrSize?: number;
    includeLabel?: boolean;
  } = {}
): Promise<Buffer> {
  const {
    columns = 3,
    rows = 8,
    qrSize = 150,
    includeLabel = true
  } = options;
  
  // Create PDF with QR codes arranged in grid
  // Each QR code with optional label below
  // Ready for printing on A4 paper
}
```

### QR Code Customization
```typescript
// Custom QR codes with logo
async function generateCustomQR(
  url: string,
  logo?: Buffer,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const qrBuffer = await generateQRCode(url, {
    ...options,
    errorCorrectionLevel: 'H'  // High error correction for logo overlay
  });
  
  if (logo) {
    // Overlay logo on QR code center
    return overlayLogo(qrBuffer, logo);
  }
  
  return qrBuffer;
}
```

### QR Code Usage Examples
```
Common Invitation QR:
┌─────────────────┐
│  ┌───────────┐  │
│  │           │  │
│  │  [QR]     │  │
│  │           │  │
│  └───────────┘  │
│  Scan to view   │
│  invitation     │
└─────────────────┘

Personalized Guest QR:
┌─────────────────┐
│  ┌───────────┐  │
│  │           │  │
│  │  [QR]     │  │
│  │           │  │
│  └───────────┘  │
│  Rahul Shah     │
│  Wedding        │
│  Sangeet,Wedding│
└─────────────────┘
```

---

## 13.5 Countdown Timer

### Countdown Component
```typescript
interface CountdownProps {
  targetDate: Date;
  targetTime?: string;
  format?: 'days' | 'full' | 'compact';
  timezone?: string;
}

function Countdown({ targetDate, targetTime, format = 'full' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const target = new Date(targetDate);
    if (targetTime) {
      const [hours, minutes] = targetTime.split(':');
      target.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);
  
  if (format === 'days') {
    return (
      <div className="countdown-days">
        <span className="number">{timeLeft.days}</span>
        <span className="label">days to go</span>
      </div>
    );
  }
  
  return (
    <div className="countdown-full">
      <div className="countdown-item">
        <span className="number">{timeLeft.days}</span>
        <span className="label">Days</span>
      </div>
      <div className="countdown-item">
        <span className="number">{timeLeft.hours}</span>
        <span className="label">Hours</span>
      </div>
      <div className="countdown-item">
        <span className="number">{timeLeft.minutes}</span>
        <span className="label">Minutes</span>
      </div>
      <div className="countdown-item">
        <span className="number">{timeLeft.seconds}</span>
        <span className="label">Seconds</span>
      </div>
    </div>
  );
}
```

### Countdown Styling
```css
.countdown-full {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-item .number {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.countdown-item .label {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
}

@media (max-width: 480px) {
  .countdown-full {
    gap: 10px;
  }
  
  .countdown-item .number {
    font-size: 32px;
  }
}
```

### Countdown Configuration
```typescript
// Template config for countdown
const countdownConfig = {
  id: 'countdown',
  type: 'countdown',
  enabled: true,
  settings: {
    format: 'full',  // 'days' | 'full' | 'compact'
    timezone: 'Asia/Kolkata',
    showOnComplete: true,  // Show when countdown ends
    completedText: 'The event is today!'
  }
};
```

### Multiple Event Countdowns
```typescript
// Show countdown for each event
function EventCountdowns({ events }) {
  return (
    <div className="event-countdowns">
      {events.map(event => (
        <div key={event.id} className="event-countdown">
          <h3>{event.name}</h3>
          <Countdown 
            targetDate={event.date}
            targetTime={event.start_time}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 13.6 Advanced Gallery

### Lightbox Component
```typescript
function Lightbox({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="lightbox-overlay">
      <button className="lightbox-close" onClick={onClose}>×</button>
      
      <button className="lightbox-prev" onClick={handlePrev}>‹</button>
      
      <div className="lightbox-content">
        <img 
          src={images[currentIndex].url} 
          alt={images[currentIndex].caption || ''}
        />
        {images[currentIndex].caption && (
          <div className="lightbox-caption">
            {images[currentIndex].caption}
          </div>
        )}
      </div>
      
      <button className="lightbox-next" onClick={handleNext}>›</button>
      
      <div className="lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
```

### Lightbox Styling
```css
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lightbox-content {
  max-width: 90%;
  max-height: 90%;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 36px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  padding: 20px;
}

.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }

.lightbox-caption {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: rgba(255, 255, 255, 0.7);
}
```

### Slideshow Mode
```typescript
function Slideshow({ images, autoPlayInterval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);
    
    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, images.length]);
  
  return (
    <div className="slideshow">
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img src={image.url} alt={image.caption || ''} />
          </div>
        ))}
      </div>
      
      <div className="slideshow-controls">
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <div className="slideshow-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Image Captions
```typescript
// Add captions to images
interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Caption editor
function CaptionEditor({ image, onSave }) {
  const [caption, setCaption] = useState(image.caption || '');
  
  return (
    <div className="caption-editor">
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption..."
        maxLength={200}
      />
      <button onClick={() => onSave({ ...image, caption })}>
        Save
      </button>
    </div>
  );
}
```

### Video Support
```typescript
// Video gallery item
interface GalleryVideo {
  id: string;
  type: 'video';
  url: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
}

// Video player component
function VideoPlayer({ video }) {
  return (
    <div className="video-player">
      <video
        src={video.url}
        poster={video.thumbnail}
        controls
        preload="metadata"
      />
      {video.caption && (
        <div className="video-caption">{video.caption}</div>
      )}
    </div>
  );
}
```

### Image Compression Options
```typescript
interface CompressionOptions {
  quality: number;  // 1-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

// Client-side compression before upload
async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Resize if needed
      if (options.maxWidth && width > options.maxWidth) {
        height = (height * options.maxWidth) / width;
        width = options.maxWidth;
      }
      
      if (options.maxHeight && height > options.maxHeight) {
        width = (width * options.maxHeight) / height;
        height = options.maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: `image/${options.format}` }));
        },
        `image/${options.format}`,
        options.quality / 100
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}
```

### Gallery Layouts
```typescript
type GalleryLayout = 'grid' | 'masonry' | 'carousel' | 'justified';

function Gallery({ images, layout = 'grid', columns = 3 }) {
  switch (layout) {
    case 'grid':
      return (
        <div className="gallery-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {images.map(image => (
            <GalleryItem key={image.id} image={image} />
          ))}
        </div>
      );
    
    case 'masonry':
      return <MasonryGallery images={images} columns={columns} />;
    
    case 'carousel':
      return <CarouselGallery images={images} />;
    
    case 'justified':
      return <JustifiedGallery images={images} />;
    
    default:
      return null;
  }
}
```

---

## 13.7 Integration with Existing Features

### RSVP in Invitation Template
```typescript
// Add RSVP section to template
const templateWithRSVP = {
  sections: [
    // ... other sections
    {
      id: 'rsvp',
      type: 'rsvp',
      enabled: true,
      settings: {
        showDeclineOption: true,
        requireMessage: false,
        maxGuests: 10
      }
    }
  ]
};
```

### Analytics in Guest Dashboard
```typescript
// Add analytics card to dashboard
function AnalyticsCard({ invitationId }) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch(`/api/invitations/${invitationId}/analytics/summary`)
      .then(res => res.json())
      .then(setStats);
  }, [invitationId]);
  
  return (
    <div className="analytics-card">
      <h3>Analytics</h3>
      <div className="stats-grid">
        <div className="stat">
          <span className="value">{stats?.views || 0}</span>
          <span className="label">Views</span>
        </div>
        <div className="stat">
          <span className="value">{stats?.links || 0}</span>
          <span className="label">Link Opens</span>
        </div>
        <div className="stat">
          <span className="value">{stats?.rsvps || 0}</span>
          <span className="label">RSVPs</span>
        </div>
      </div>
    </div>
  );
}
```

### Guest Groups in Event Assignment
```typescript
// Assign events to group
function GroupEventAssignment({ groups, events }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  
  const handleAssign = async () => {
    await fetch(`/api/invitations/${invitationId}/groups/${selectedGroup}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds: selectedEvents })
    });
  };
  
  return (
    <div className="group-event-assignment">
      <select onChange={(e) => setSelectedGroup(e.target.value)}>
        <option value="">Select Group</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>
      
      <div className="event-checkboxes">
        {events.map(event => (
          <label key={event.id}>
            <input
              type="checkbox"
              checked={selectedEvents.includes(event.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEvents([...selectedEvents, event.id]);
                } else {
                  setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                }
              }}
            />
            {event.name}
          </label>
        ))}
      </div>
      
      <button onClick={handleAssign}>Assign to Group</button>
    </div>
  );
}
```

---

## 13.8 Testing

### RSVP Tests
```typescript
describe('RSVP System', () => {
  describe('POST /api/invitations/:id/rsvp', () => {
    it('should accept RSVP with valid data');
    it('should reject RSVP with invalid guest token');
    it('should update existing RSVP');
    it('should send notification to customer');
  });
  
  describe('GET /api/invitations/:id/rsvp/list', () => {
    it('should return all RSVPs for invitation');
    it('should group by response type');
    it('should calculate total attending');
  });
});
```

### Analytics Tests
```typescript
describe('Analytics', () => {
  describe('POST /api/analytics/track', () => {
    it('should track view event');
    it('should track link open event');
    it('should track RSVP event');
  });
  
  describe('GET /api/invitations/:id/analytics/summary', () => {
    it('should return correct view count');
    it('should return device breakdown');
    it('should return location breakdown');
  });
});
```

### QR Code Tests
```typescript
describe('QR Codes', () => {
  describe('GET /api/invitations/:id/qr', () => {
    it('should generate QR code for common invitation');
    it('should return PNG by default');
    it('should return SVG when format=svg');
  });
  
  describe('GET /api/invitations/:id/guests/:guestId/qr', () => {
    it('should generate personalized QR code');
    it('should include guest token in URL');
  });
});
```

---

## Deliverables

- [ ] RSVP system (button, form, dashboard)
- [ ] RSVP notifications
- [ ] RSVP export
- [ ] Analytics dashboard
- [ ] Analytics data collection
- [ ] Guest groups (CRUD)
- [ ] Group-based event assignment
- [ ] QR code generation
- [ ] QR code download (PNG/SVG)
- [ ] Print-ready QR sheets
- [ ] Countdown timer
- [ ] Advanced gallery (lightbox, slideshow)
- [ ] Image captions
- [ ] Video support
- [ ] Image compression options
