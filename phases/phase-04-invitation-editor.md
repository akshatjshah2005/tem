# Phase 04 — Invitation Editor

**Duration:** 3 weeks
**Goal:** Canva-like editor for customizing invitations

---

## 4.1 Editor Layout

```
┌─────────────────────────────────────────────────────┐
│  Toolbar                                             │
│  [Undo] [Redo] | [Preview] [Save] [Publish]        │
├──────┬──────────────────────────────┬───────────────┤
│      │                              │               │
│  S   │                              │               │
│  E   │      INVITATION              │   PROPERTIES  │
│  C   │      PREVIEW                 │               │
│  T   │      (Canvas)                │   [Field]     │
│  I   │                              │   [Value]     │
│  O   │                              │               │
│  N   │                              │   [Style]     │
│  S   │                              │               │
│      │                              │               │
├──────┴──────────────────────────────┴───────────────┤
│  Status: Saved ✓                                    │
└─────────────────────────────────────────────────────┘
```

### Left Panel — Sections
- [ ] Section list (draggable)
- [ ] Add section button
- [ ] Section visibility toggle
- [ ] Section order (drag to reorder)

### Center Panel — Canvas
- [ ] Live preview of invitation
- [ ] Responsive preview toggle (Desktop/Tablet/Mobile)
- [ ] Zoom controls
- [ ] Click to select elements

### Right Panel — Properties
- [ ] Dynamic form based on selected element
- [ ] Field inputs (text, date, image upload)
- [ ] Style controls (where admin allows)
- [ ] Validation feedback

---

## 4.2 Editor Components

### Section Editor
```typescript
interface SectionEditorProps {
  section: SectionConfig;
  content: Record<string, any>;
  onChange: (sectionId: string, value: any) => void;
  isEditable: boolean;
}
```

### Field Types
- [ ] **Text Input**: Single line text
- [ ] **Text Area**: Multi-line text
- [ ] **Date Picker**: Date selection
- [ ] **Time Picker**: Time selection
- [ ] **Image Upload**: Single image
- [ ] **Gallery Upload**: Multiple images
- [ ] **Select**: Dropdown selection
- [ ] **Color Picker**: Color selection (admin only)
- [ ] **Map Picker**: Google Maps location

### Form Builder
```typescript
interface FieldConfig {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'image' | 'gallery' | 'select' | 'color' | 'map';
  label: string;
  variable: string;  // Template variable name
  placeholder?: string;
  required: boolean;
  editable: boolean;  // Admin-controlled
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message: string;
  };
  options?: { label: string; value: string }[];  // For select type
}
```

---

## 4.3 Editor Features

### Undo/Redo
- [ ] Undo stack (max 50 actions)
- [ ] Redo stack
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] Visual undo/redo buttons

### Auto-Save
- [ ] Save on every change (debounced 2 seconds)
- [ ] Save indicator (Saved/Saving/Unsaved)
- [ ] Conflict resolution (concurrent edits)
- [ ] Offline support with sync

### Preview
- [ ] Real-time preview as user edits
- [ ] Desktop preview (1920×1080)
- [ ] Tablet preview (768×1024)
- [ ] Mobile preview (375×812)
- [ ] Personalized preview (with sample guest)
- [ ] Full-screen preview mode

### Validation
- [ ] Required field validation
- [ ] Character limits
- [ ] Date format validation
- [ ] Image size/type validation
- [ ] Real-time error display

---

## 4.4 Editor Sections

### Hero Section
- [ ] Background image upload
- [ ] Couple names (bride/groom)
- [ ] Wedding date
- [ ] Font selection (admin-controlled)
- [ ] Text color
- [ ] Animation selection

### Event Section
- [ ] Add event form
- [ ] Edit event form
- [ ] Delete event
- [ ] Reorder events (drag & drop)
- [ ] Event image upload
- [ ] Map location picker

### Gallery Section
- [ ] Image upload (drag & drop)
- [ ] Image reorder (drag & drop)
- [ ] Image delete
- [ ] Image preview
- [ ] Image count limit

### RSVP Section
- [ ] Toggle RSVP on/off
- [ ] Configure fields
- [ ] Custom message

---

## 4.5 API Endpoints — Editor

```
GET    /api/invitations/:id/editor       # Get editor state
PUT    /api/invitations/:id/content      # Update invitation content
POST   /api/invitations/:id/media        # Upload media
DELETE /api/invitations/:id/media/:mediaId # Delete media
PUT    /api/invitations/:id/sections     # Update section order
GET    /api/invitations/:id/preview      # Get rendered preview
POST   /api/invitations/:id/autosave     # Auto-save endpoint
```

---

## 4.6 State Management

### Editor State
```typescript
interface EditorState {
  invitation: Invitation;
  sections: Section[];
  content: Record<string, any>;
  events: Event[];
  media: Media[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  undoStack: Action[];
  redoStack: Action[];
}
```

### Actions
- [ ] UPDATE_CONTENT: Update a content field
- [ ] ADD_EVENT: Add new event
- [ ] UPDATE_EVENT: Update event details
- [ ] DELETE_EVENT: Remove event
- [ ] REORDER_EVENTS: Change event order
- [ ] UPLOAD_MEDIA: Add media file
- [ ] DELETE_MEDIA: Remove media
- [ ] REORDER_MEDIA: Change media order
- [ ] UNDO: Undo last action
- [ ] REDO: Redo last undone action
- [ ] SAVE: Save to server

---

## 4.7 Responsive Design

### Mobile Editor
- [ ] Simplified layout for mobile editing
- [ ] Bottom sheet for properties
- [ ] Swipe between sections
- [ ] Touch-friendly inputs

### Desktop Editor
- [ ] Full three-panel layout
- [ ] Keyboard shortcuts
- [ ] Mouse drag & drop

---

## Deliverables

- [ ] Working editor with three-panel layout
- [ ] All section types editable
- [ ] Undo/redo functionality
- [ ] Auto-save working
- [ ] Preview modes (desktop/tablet/mobile)
- [ ] Personalized preview
- [ ] Responsive editor layout
- [ ] Form validation
- [ ] Image upload with preview
