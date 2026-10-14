# Phase 01 — Infrastructure & Database

**Duration:** 2 weeks
**Goal:** Set up project foundation, database schema, and core infrastructure

---

## 1.1 Project Setup

### Repository & Tooling
- [ ] Initialize Git repository
- [ ] Set up monorepo structure (if using separate frontend/backend)
- [ ] Configure ESLint + Prettier
- [ ] Set up TypeScript config
- [ ] Configure environment variables (.env.example)
- [ ] Set up Docker + docker-compose for local dev
- [ ] Configure CI/CD pipeline (GitHub Actions)
- [ ] Set up branch protection rules

### Project Structure
```
digital-invitations/
├── apps/
│   ├── web/                    # Customer-facing frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── styles/
│   │   │   └── types/
│   │   └── public/
│   ├── admin/                  # Admin panel
│   │   └── src/
│   ├── api/                    # Backend API
│   │   └── src/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── services/
│   │       ├── middleware/
│   │       ├── routes/
│   │       └── utils/
│   └── invitation-renderer/    # Dynamic invitation rendering engine
│       └── src/
├── packages/
│   ├── shared/                 # Shared types & utils
│   ├── database/               # DB schema & migrations
│   └── ui/                     # Shared UI components
├── templates/                  # Template source files
│   ├── wedding-01/
│   ├── wedding-02/
│   └── ...
├── docs/
└── scripts/
```

---

## 1.2 Database Design

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    mobile_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### categories
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### templates
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    config JSONB NOT NULL DEFAULT '{}',  -- Template configuration
    features JSONB NOT NULL DEFAULT '{}', -- Feature flags
    editable_fields JSONB NOT NULL DEFAULT '{}', -- What customers can edit
    variables JSONB NOT NULL DEFAULT '{}', -- Dynamic variables definition
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_premium BOOLEAN DEFAULT false,
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### template_versions
```sql
CREATE TABLE template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    config JSONB NOT NULL,
    features JSONB NOT NULL,
    editable_fields JSONB NOT NULL,
    variables JSONB NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(template_id, version)
);
```

#### invitations
```sql
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Customer content (dynamic variables)
    content JSONB NOT NULL DEFAULT '{}',
    -- Example: { "bride_name": "Priya", "groom_name": "Akshat", "family_name": "Shah Family" }
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
    is_personalized BOOLEAN DEFAULT false,
    personalization_enabled BOOLEAN DEFAULT false,
    
    -- Media
    cover_image_url TEXT,
    
    -- Settings
    whatsapp_message_template TEXT,
    
    -- Stats
    guest_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    
    -- Expiration
    expires_at TIMESTAMP,
    
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, slug)
);
```

#### events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue_name VARCHAR(255),
    venue_address TEXT,
    map_url TEXT,
    map_lat DECIMAL(10, 8),
    map_lng DECIMAL(11, 8),
    dress_code VARCHAR(255),
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### guests
```sql
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    email VARCHAR(255),
    group_name VARCHAR(100),  -- Future: family, friends, etc.
    
    -- Personalization
    personal_token VARCHAR(20) UNIQUE NOT NULL,  -- Secure random token
    personalized_link TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'link_generated' CHECK (status IN (
        'link_generated', 'sent', 'opened', 'rsvp_received', 'attending', 'not_attending'
    )),
    
    -- Stats
    opened_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    
    -- Custom message
    custom_message TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### guest_events (junction)
```sql
CREATE TABLE guest_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(guest_id, event_id)
);
```

#### media
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    
    original_url TEXT NOT NULL,
    optimized_url TEXT,
    thumbnail_url TEXT,
    
    file_name VARCHAR(255),
    file_size INTEGER,  -- bytes
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    
    -- Gallery
    gallery_order INTEGER,
    is_cover BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### whatsapp_messages
```sql
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
    template_text TEXT NOT NULL,
    -- Example: "Dear {{guest_name}}, You are invited to {{event_name}}. {{invitation_link}}"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### bulk_requests
```sql
CREATE TABLE bulk_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    invitation_id UUID REFERENCES invitations(id),
    
    recipient_count INTEGER NOT NULL,
    message TEXT,
    send_date DATE,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'contacting', 'in_progress', 'completed', 'cancelled'
    )),
    
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 1.3 Database Migrations

- [ ] Set up migration tool (Prisma / Knex / Drizzle / Alembic)
- [ ] Create initial migration with all tables
- [ ] Add indexes for performance:
  ```sql
  CREATE INDEX idx_invitations_user_id ON invitations(user_id);
  CREATE INDEX idx_invitations_slug ON invitations(slug);
  CREATE INDEX idx_events_invitation_id ON events(invitation_id);
  CREATE INDEX idx_guests_invitation_id ON guests(invitation_id);
  CREATE INDEX idx_guests_personal_token ON guests(personal_token);
  CREATE INDEX idx_guest_events_guest_id ON guest_events(guest_id);
  CREATE INDEX idx_guest_events_event_id ON guest_events(event_id);
  CREATE INDEX idx_media_invitation_id ON media(invitation_id);
  CREATE INDEX idx_templates_category_id ON templates(category_id);
  CREATE INDEX idx_templates_status ON templates(status);
  ```
- [ ] Seed default categories (Wedding, Engagement, Baby Shower, Birthday, Anniversary, etc.)
- [ ] Create admin user seed

---

## 1.4 API Foundation

- [ ] Set up Express/FastAPI/Django project
- [ ] Configure CORS
- [ ] Set up rate limiting middleware
- [ ] Set up request logging
- [ ] Set up error handling middleware
- [ ] Configure body parser (JSON, multipart)
- [ ] Set up health check endpoint
- [ ] Create API response format standard:
  ```json
  {
    "success": true,
    "data": {},
    "message": "",
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```

---

## 1.5 File Storage Setup

- [ ] Configure S3/R2 bucket
- [ ] Set up file upload middleware
- [ ] Configure image processing pipeline (Sharp/ Pillow)
- [ ] Set up CDN for static assets
- [ ] Create upload utility functions:
  - [ ] generateUploadUrl()
  - [ ] uploadFile()
  - [ ] deleteFile()
  - [ ] getOptimizedUrl()
  - [ ] getThumbnailUrl()

---

## 1.6 Environment Configuration

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/invitations
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# File Storage
S3_BUCKET=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
CDN_URL=https://cdn.yourdomain.com

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
INVITATION_URL=http://localhost:3000/i

# Email (future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# WhatsApp (future)
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
```

---

## Deliverables

- [ ] Working project structure
- [ ] Database schema with migrations
- [ ] Seed data
- [ ] Basic API server running
- [ ] File storage configured
- [ ] Docker environment working
- [ ] CI/CD pipeline basic setup
