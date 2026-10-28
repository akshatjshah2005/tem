/**
 * Template engine types.
 *
 * A template is pure configuration (design tokens + section list + feature
 * flags). The rendering engine combines that configuration with invitation
 * content, events, guests and media to produce a serialisable RenderModel
 * which is then handed to a design implementation.
 */

export type SectionType =
  | 'hero'
  | 'guest_greeting'
  | 'message'
  | 'countdown'
  | 'event_list'
  | 'gallery'
  | 'rsvp'
  | 'closing'
  | 'personalization_notice'
  | string;

export interface TemplateSection {
  id: string;
  type: SectionType;
  enabled?: boolean;
  /** Every section may carry arbitrary, interpolated string/number options. */
  [key: string]: unknown;
}

export interface TemplatePalette {
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  gold: string;
  goldDeep: string;
  goldSoft: string;
  heroText: string;
  heroOverlay: string;
}

export interface TemplateTypography {
  script: string;
  serif: string;
  sans: string;
}

export interface TemplateDesign {
  palette: TemplatePalette;
  typography: TemplateTypography;
  copy: Record<string, string>;
}

export interface TemplateConfig {
  schemaVersion?: number;
  impl?: string;
  variant?: string;
  design?: Partial<TemplateDesign> & { palette?: Partial<TemplatePalette>; typography?: Partial<TemplateTypography> };
  sections?: TemplateSection[];
}

export type EditableFieldType = 'text' | 'textarea' | 'url' | 'date' | 'number' | 'boolean' | 'image' | string;

export interface EditableField {
  type?: EditableFieldType;
  label?: string;
  required?: boolean;
  editable?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
}

export interface TemplateFeatures {
  multipleEvents?: boolean;
  gallery?: boolean;
  guestPersonalization?: boolean;
  guestEventFiltering?: boolean;
  map?: boolean;
  countdown?: boolean;
  rsvp?: boolean;
  music?: boolean;
  [key: string]: boolean | undefined;
}

export interface TemplateSummary {
  id: string;
  name: string;
  slug: string;
  version?: string;
  status?: string;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  isPremium?: boolean;
  features?: TemplateFeatures | Record<string, unknown> | null;
  variables?: Record<string, unknown> | null;
  editableFields?: Record<string, EditableField> | null;
  config?: TemplateConfig | Record<string, unknown> | string | null;
}

export type NameLengthClass = 'normal' | 'long' | 'very-long';

export interface RenderEvent {
  id: string;
  name: string;
  nameClass: NameLengthClass;
  description?: string | null;
  /** ISO-8601 date as returned by the API. */
  date: string;
  /** Local-time Date built from the stored calendar date (timezone safe). */
  dateLabel: string;
  weekday: string;
  dayNumber: string;
  monthYear: string;
  startTime?: string | null;
  endTime?: string | null;
  timeLabel: string;
  venueName?: string | null;
  venueAddress?: string | null;
  mapUrl?: string | null;
  mapLink: string | null;
  dressCode?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  /** ISO string used by the countdown timer. */
  startIso: string;
  /** Computed when the model is built so server and client agree. */
  isPast: boolean;
  /** Milliseconds until the event starts, calculated while building the model. */
  remainingMs: number;
}

export interface RenderMedia {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  alt: string;
  isCover: boolean;
  isImage: boolean;
}

export interface RenderGuest {
  id: string;
  name: string;
  firstName: string;
  nameClass: NameLengthClass;
  groupName?: string | null;
  mobile?: string | null;
  email?: string | null;
  personalToken: string;
  assignedEventIds: string[];
  hasEventAssignments: boolean;
}

export interface RenderRsvp {
  response: string;
  guestsCount: number;
  message?: string | null;
  dietary?: string | null;
  respondedAt?: string | null;
}

export interface RenderModel {
  template: {
    id: string;
    name: string;
    slug: string;
    version: string;
    status: string;
    isPremium: boolean;
    impl: string;
    variant: string;
    features: TemplateFeatures;
    design: TemplateDesign;
    editableFields: Record<string, EditableField>;
    sections: TemplateSection[];
  };
  invitation: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    status: string;
    isPersonalized: boolean;
    personalizationEnabled: boolean;
    hostName: string;
    coverImageUrl?: string | null;
    /** Absolute URL of the currently rendered page (empty on the server). */
    url: string;
    content: Record<string, unknown>;
  };
  /** All dynamic variables available to `{{...}}` interpolation. */
  variables: Record<string, string>;
  /** Dynamic events visible to this viewer (already guest scoped). */
  events: RenderEvent[];
  eventScope: 'all' | 'assigned';
  gallery: RenderMedia[];
  cover: RenderMedia | null;
  primaryEvent: RenderEvent | null;
  guest: RenderGuest | null;
  rsvp: RenderRsvp | null;
  isPersonalized: boolean;
}

export const DEFAULT_PALETTE: TemplatePalette = {
  paper: '#ffffff',
  surface: '#ffffff',
  ink: '#1f2937',
  muted: '#6b7280',
  gold: '#a8802f',
  goldDeep: '#7d5c1d',
  goldSoft: '#e8d9b8',
  heroText: '#ffffff',
  heroOverlay: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.65) 100%)'
};

export const DEFAULT_TYPOGRAPHY: TemplateTypography = {
  script: "'Cormorant Garamond', Georgia, serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "var(--font-inter), system-ui, -apple-system, sans-serif"
};

export const DEFAULT_COPY: Record<string, string> = {
  heroEyebrow: '',
  guestLead: 'You are cordially invited to celebrate with us',
  messageHeading: 'Invitation',
  message: '',
  countdownLabel: 'Counting down',
  eventsHeading: 'Event Details',
  eventsLead: '',
  galleryHeading: 'Gallery',
  galleryLead: '',
  rsvpHeading: 'RSVP',
  rsvpNote: '',
  closingLine: 'With love',
  shareHeading: 'Share this invitation',
  noticeText:
    'This is a general view of the invitation. The host may have prepared a personalized version just for you.',
  noEventsText: 'Event details will be announced shortly.',
  footerText: 'Created with Digital Invitation Platform'
};
