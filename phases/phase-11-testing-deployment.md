# Phase 11 — Testing & Deployment

**Duration:** 2 weeks
**Goal:** Testing, CI/CD, and production deployment

---

## 11.1 Testing Strategy

### Test Types
```
Unit Tests (70%)
├── Functions
├── Utilities
├── Validators
└── Services

Integration Tests (20%)
├── API Endpoints
├── Database Queries
└── File Upload

E2E Tests (10%)
├── Critical User Flows
└── Cross-browser Testing
```

### Testing Tools
- [ ] Unit: Jest / Vitest
- [ ] Integration: Supertest
- [ ] E2E: Playwright / Cypress
- [ ] API: Postman / Newman
- [ ] Load: k6 / Artillery

---

## 11.2 Unit Tests

### Auth Tests
```typescript
describe('Auth Service', () => {
  describe('register', () => {
    it('should create user with hashed password');
    it('should reject duplicate email');
    it('should reject invalid email format');
    it('should reject weak password');
  });
  
  describe('login', () => {
    it('should return token for valid credentials');
    it('should reject invalid password');
    it('should lock account after 5 failures');
  });
});
```

### Guest Tests
```typescript
describe('Guest Service', () => {
  describe('createGuest', () => {
    it('should generate unique personal token');
    it('should validate mobile number');
    it('should reject duplicate mobile');
  });
  
  describe('importFromExcel', () => {
    it('should parse valid Excel file');
    it('should identify missing names');
    it('should identify invalid mobiles');
    it('should identify duplicate mobiles');
    it('should identify unknown events');
  });
});
```

### Template Tests
```typescript
describe('Template Engine', () => {
  describe('renderInvitation', () => {
    it('should replace variables');
    it('should filter events for personalized view');
    it('should render guest name');
    it('should handle missing variables gracefully');
  });
});
```

---

## 11.3 Integration Tests

### API Tests
```typescript
describe('POST /api/auth/register', () => {
  it('should register new user');
  it('should return 400 for invalid data');
  it('should return 409 for duplicate email');
});

describe('GET /api/invitations', () => {
  it('should return user invitations');
  it('should paginate results');
  it('should filter by status');
});

describe('POST /api/invitations/:id/guests/import', () => {
  it('should import valid Excel');
  it('should return errors for invalid data');
  it('should generate personal tokens');
});
```

---

## 11.4 E2E Tests

### Critical Flows
```typescript
test('Complete invitation flow', async ({ page }) => {
  // 1. Register
  await page.goto('/register');
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="mobile"]', '9876543210');
  await page.fill('[name="password"]', 'Password123');
  await page.click('button[type="submit"]');
  
  // 2. Create invitation
  await page.click('text=Create New Invitation');
  await page.fill('[name="name"]', 'Test Wedding');
  await page.selectOption('[name="category"]', 'wedding');
  await page.click('text=Next');
  
  // 3. Select template
  await page.click('[data-template="wedding-01"]');
  await page.click('text=Use Template');
  
  // 4. Edit invitation
  await page.fill('[name="bride_name"]', 'Priya');
  await page.fill('[name="groom_name"]', 'Akshat');
  await page.click('text=Save');
  
  // 5. Add event
  await page.click('text=Add Event');
  await page.fill('[name="event_name"]', 'Wedding');
  await page.fill('[name="date"]', '2026-12-15');
  await page.click('text=Save Event');
  
  // 6. Add guest
  await page.click('text=Guests');
  await page.click('text=Add Guest');
  await page.fill('[name="guest_name"]', 'Rahul Shah');
  await page.fill('[name="mobile"]', '9876543210');
  await page.click('text=Save');
  
  // 7. Publish
  await page.click('text=Publish');
  await page.waitForURL('**/i/test-wedding');
});
```

---

## 11.5 Performance Testing

### Load Test Scenario
```javascript
// k6 script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 200 },  // Ramp up
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% errors
  },
};

export default function () {
  const res = http.get('https://inv.me/i/akshat-wedding');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Performance Targets
- [ ] Page load: < 3 seconds on 3G
- [ ] API response: < 200ms (p95)
- [ ] Image load: < 2 seconds
- [ ] Invitation render: < 500ms
- [ ] Lighthouse score: > 90

---

## 11.6 CI/CD Pipeline

### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run test:integration
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - run: npm run deploy
```

---

## 11.7 Deployment

### Hosting Setup
```
Frontend: Vercel / Netlify
├── Automatic deployments from main
├── Preview deployments for PRs
├── Edge functions for SSR
└── CDN for static assets

Backend: Railway / Render / AWS
├── Docker container
├── PostgreSQL database
├── Redis cache
└── File storage (S3/R2)
```

### Environment Variables
```bash
# Production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
S3_BUCKET=...
CDN_URL=https://cdn.inv.me
APP_URL=https://inv.me
API_URL=https://api.inv.me
```

### Domain Setup
```
inv.me                    → Frontend (Vercel)
api.inv.me                → Backend (Railway)
cdn.inv.me                → CDN (Cloudflare)
i.inv.me                  → Invitation pages (Vercel)
```

---

## 11.8 Monitoring

### Application Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic / DataDog)
- [ ] Uptime monitoring (BetterStack)
- [ ] Log aggregation (Papertrail / Logtail)

### Database Monitoring
- [ ] Query performance
- [ ] Connection pool
- [ ] Slow queries
- [ ] Disk usage

### Alerts
- [ ] Error rate spike
- [ ] Response time degradation
- [ ] Database connection issues
- [ ] Disk space low
- [ ] SSL certificate expiry

---

## 11.9 Backup Strategy

### Database Backups
- [ ] Daily automated backups
- [ ] 30-day retention
- [ ] Point-in-time recovery
- [ ] Test restore monthly

### File Backups
- [ ] S3 versioning enabled
- [ ] Cross-region replication
- [ ] Lifecycle policies

---

## 11.10 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] SSL certificates installed
- [ ] DNS configured
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Error tracking configured

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints
- [ ] Test critical flows
- [ ] Monitor error rates
- [ ] Announce launch

### Post-Launch
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan Phase 2

---

## Deliverables

- [ ] Unit tests (70% coverage)
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Performance tests
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Launch checklist complete
