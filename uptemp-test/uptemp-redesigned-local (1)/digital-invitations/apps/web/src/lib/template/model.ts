import {
  DEFAULT_COPY,
  DEFAULT_PALETTE,
  DEFAULT_TYPOGRAPHY,
  EditableField,
  NameLengthClass,
  RenderEvent,
  RenderGuest,
  RenderMedia,
  RenderModel,
  RenderRsvp,
  TemplateConfig,
  TemplateDesign,
  TemplateSection,
  TemplateSummary
} from './types';
import { flattenContent, interpolate, VariableBag } from './variables';

/* -------------------------------------------------------------------------- */
/* Raw API payloads                                                            */
/* -------------------------------------------------------------------------- */

export interface RawEvent {
  id: string;
  name: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  mapUrl?: string | null;
  dressCode?: string | null;
  imageUrl?: string | null;
  displayOrder?: number | null;
}

export interface RawMedia {
  id: string;
  originalUrl: string;
  optimizedUrl?: string | null;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  isCover?: boolean | null;
  galleryOrder?: number | null;
}

export interface RawGuest {
  id: string;
  name: string;
  groupName?: string | null;
  mobile?: string | null;
  email?: string | null;
  personalToken: string;
  guestEvents?: { event: RawEvent }[] | null;
  rsvp?: {
    response?: string | null;
    guestsCount?: number | null;
    message?: string | null;
    dietary?: string | null;
    respondedAt?: string | null;
  } | null;
}

export interface RawInvitation {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  isPersonalized?: boolean;
  personalizationEnabled?: boolean;
  coverImageUrl?: string | null;
  content?: Record<string, unknown> | null;
  user?: { name?: string | null } | null;
  events?: RawEvent[] | null;
  media?: RawMedia[] | null;
}

export interface BuildModelInput {
  invitation: RawInvitation;
  template?: TemplateSummary | null;
  guest?: RawGuest | null;
  /** Absolute URL of the page being rendered (used for share links). */
  pageUrl?: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/** Extracts `YYYY-MM-DD` from any date representation returned by the API. */
function calendarParts(dateIso?: string | null): { year: number; month: number; day: number } | null {
  if (!dateIso) return null;
  const match = String(dateIso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function calendarDate(dateIso?: string | null): Date | null {
  const parts = calendarParts(dateIso);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day);
}

/** Reads the wall-clock time stored in a `@db.Time` column. */
function timeParts(timeIso?: string | null): { hours: number; minutes: number } | null {
  if (!timeIso) return null;
  const match = String(timeIso).match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function nameLengthClass(name: string, longAt: number, veryLongAt: number): NameLengthClass {
  if (name.length > veryLongAt) return 'very-long';
  if (name.length > longAt) return 'long';
  return 'normal';
}

function mediaUrl(media: RawMedia): string {
  return media.optimizedUrl || media.originalUrl;
}

function isImageMedia(media: RawMedia): boolean {
  return (media.mimeType || '').startsWith('image/');
}

function isVideoUrl(url: string): boolean {
  const path = url.split(/[?#]/, 1)[0].toLowerCase();
  return /\\.(mp4|webm|mov|m4v|ogv)$/.test(path);
}

function googleMapsLink(venue?: string | null, address?: string | null, mapUrl?: string | null): string | null {
  if (mapUrl && text(mapUrl)) return text(mapUrl);
  const query = `${text(venue)} ${text(address)}`.trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function normalizeEvent(raw: RawEvent, index: number): RenderEvent {
  const date = calendarDate(raw.date);
  const start = timeParts(raw.startTime);
  const end = timeParts(raw.endTime);

  const dateLabel = date
    ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const weekday = date ? date.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const dayNumber = date ? String(date.getDate()) : '';
  const monthYear = date ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  let timeLabel = '';
  if (start && end) {
    timeLabel = `${pad(start.hours)}:${pad(start.minutes)} - ${pad(end.hours)}:${pad(end.minutes)}`;
  } else if (start) {
    timeLabel = `${pad(start.hours)}:${pad(start.minutes)}`;
  } else if (end) {
    timeLabel = `${pad(end.hours)}:${pad(end.minutes)}`;
  }

  const datePart = String(raw.date || '').slice(0, 10);
  const startIso = datePart
    ? `${datePart}T${start ? `${pad(start.hours)}:${pad(start.minutes)}` : '00:00'}:00`
    : '';
  const targetTime = startIso ? new Date(startIso).getTime() : Number.NaN;
  const targetValid = !Number.isNaN(targetTime);

  return {
    id: raw.id,
    name: text(raw.name) || 'Event',
    nameClass: nameLengthClass(text(raw.name), 26, 42),
    description: raw.description ?? null,
    date: raw.date,
    dateLabel,
    weekday,
    dayNumber,
    monthYear,
    startTime: raw.startTime ?? null,
    endTime: raw.endTime ?? null,
    timeLabel,
    venueName: raw.venueName ?? null,
    venueAddress: raw.venueAddress ?? null,
    mapUrl: raw.mapUrl ?? null,
    mapLink: googleMapsLink(raw.venueName, raw.venueAddress, raw.mapUrl),
    dressCode: raw.dressCode ?? null,
    imageUrl: raw.imageUrl ?? null,
    displayOrder: raw.displayOrder ?? index,
    startIso,
    isPast: targetValid ? targetTime < Date.now() : false,
    remainingMs: targetValid ? Math.max(0, targetTime - Date.now()) : 0
  };
}

function interpolateDeep(value: unknown, variables: VariableBag): unknown {
  if (typeof value === 'string') return interpolate(value, variables);
  if (Array.isArray(value)) return value.map((item) => interpolateDeep(item, variables));
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = interpolateDeep(entry, variables);
    }
    return result;
  }
  return value;
}

const DEFAULT_SECTIONS: TemplateSection[] = [
  { id: 'hero', type: 'hero', enabled: true },
  { id: 'guest', type: 'guest_greeting', enabled: true },
  { id: 'message', type: 'message', enabled: true },
  { id: 'countdown', type: 'countdown', enabled: true },
  { id: 'events', type: 'event_list', enabled: true },
  { id: 'gallery', type: 'gallery', enabled: true },
  { id: 'notice', type: 'personalization_notice', enabled: true },
  { id: 'rsvp', type: 'rsvp', enabled: true },
  { id: 'closing', type: 'closing', enabled: true }
];

/* -------------------------------------------------------------------------- */
/* Model builder                                                               */
/* -------------------------------------------------------------------------- */

export function buildRenderModel(input: BuildModelInput): RenderModel {
  const { invitation, template, guest } = input;

  const rawConfig = asRecord(template?.config);
  const config: TemplateConfig = {
    schemaVersion: typeof rawConfig.schemaVersion === 'number' ? rawConfig.schemaVersion : 1,
    impl: text(rawConfig.impl) || 'default',
    variant: text(rawConfig.variant) || 'default',
    design: asRecord(rawConfig.design) as TemplateConfig['design'],
    sections: Array.isArray(rawConfig.sections) ? (rawConfig.sections as TemplateSection[]) : []
  };

  const designConfig = config.design || {};
  const design: TemplateDesign = {
    palette: { ...DEFAULT_PALETTE, ...(designConfig.palette || {}) },
    typography: { ...DEFAULT_TYPOGRAPHY, ...(designConfig.typography || {}) },
    copy: { ...DEFAULT_COPY, ...(designConfig.copy || {}) }
  };

  const content = asRecord(invitation.content);
  const contentBag = flattenContent(content);

  const allEvents = (invitation.events || []).map(normalizeEvent);

  /* --- guest + event scoping ------------------------------------------- */
  const assignedEventIds = (guest?.guestEvents || []).map((entry) => entry?.event?.id).filter(Boolean);
  const hasAssignments = assignedEventIds.length > 0;

  const events = hasAssignments
    ? allEvents.filter((event) => assignedEventIds.includes(event.id))
    : allEvents;

  const primaryEvent = events[0] || null;

  /* --- computed variables ---------------------------------------------- */
  const brideName = text(contentBag.bride_name);
  const groomName = text(contentBag.groom_name);
  const guestName = guest ? text(guest.name) : '';

  const coupleNames =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || invitation.name;

  const computed: VariableBag = {
    invitation_name: invitation.name,
    invitationName: invitation.name,
    invitation_slug: invitation.slug,
    invitationSlug: invitation.slug,
    invitation_description: text(invitation.description),
    invitationDescription: text(invitation.description),
    invitation_link: input.pageUrl || '',
    invitationLink: input.pageUrl || '',
    host_name: text(invitation.user?.name),
    hostName: text(invitation.user?.name),
    couple_names: coupleNames,
    coupleNames,
    bride_name: brideName,
    brideName,
    groom_name: groomName,
    groomName,
    family_name: text(contentBag.family_name),
    familyName: text(contentBag.family_name),
    guest_name: guestName,
    guestName,
    guest_first_name: guestName ? guestName.split(/\s+/)[0] : '',
    guestFirstName: guestName ? guestName.split(/\s+/)[0] : '',
    guest_group: text(guest?.groupName),
    guestGroup: text(guest?.groupName),
    event_name: primaryEvent?.name || '',
    eventName: primaryEvent?.name || '',
    event_date: primaryEvent?.dateLabel || '',
    eventDate: primaryEvent?.dateLabel || '',
    event_time: primaryEvent?.timeLabel || '',
    eventTime: primaryEvent?.timeLabel || '',
    venue_name: text(primaryEvent?.venueName),
    venueName: text(primaryEvent?.venueName),
    venue_address: text(primaryEvent?.venueAddress),
    venueAddress: text(primaryEvent?.venueAddress),
    current_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    rsvp_status: guest?.rsvp?.response || '',
    rsvpStatus: guest?.rsvp?.response || ''
  };

  const baseVariables: VariableBag = { ...contentBag, ...computed };

  /* --- copy resolution (defaults <- customer content) ------------------- */
  const resolvedCopy: Record<string, string> = {};
  for (const [copyKey, defaultValue] of Object.entries(design.copy)) {
    const override = contentBag[copyKey];
    const source =
      override !== undefined && override !== null && text(override) !== ''
        ? String(override)
        : defaultValue;
    resolvedCopy[copyKey] = interpolate(source, baseVariables);
  }
  design.copy = resolvedCopy;

  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...contentBag, ...computed, ...resolvedCopy })) {
    variables[key] = value === null || value === undefined ? '' : String(value);
  }

  /* --- sections --------------------------------------------------------- */
  const rawSections = config.sections && config.sections.length > 0 ? config.sections : DEFAULT_SECTIONS;
  const sections: TemplateSection[] = (interpolateDeep(rawSections, variables) as TemplateSection[]).map(
    (section) => ({
      ...section,
      enabled: section.enabled !== false
    })
  );

  /* --- media ------------------------------------------------------------ */
  const media = (invitation.media || []).slice().sort((a, b) => {
    const orderA = a.galleryOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.galleryOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const coverMedia = media.find((item) => item.isCover) || null;
  const contentCoverUrl = text(contentBag.cover_image);
  const coverUrl = contentCoverUrl || (coverMedia ? mediaUrl(coverMedia) : text(invitation.coverImageUrl));

  let galleryItems = media.filter((item) => !item.isCover);
  if (galleryItems.length === 0) galleryItems = media;

  const gallerySection = sections.find((section) => section.type === 'gallery');
  const maxImages =
    typeof gallerySection?.maxImages === 'number' ? gallerySection.maxImages : Number.MAX_SAFE_INTEGER;

  const gallery: RenderMedia[] = galleryItems.slice(0, maxImages).map((item) => ({
    id: item.id,
    url: mediaUrl(item),
    thumbnailUrl: item.thumbnailUrl || null,
    alt: text(item.fileName) || invitation.name,
    isCover: Boolean(item.isCover),
    isImage: isImageMedia(item)
  }));

  const coverIsImage = coverUrl
    ? coverMedia && mediaUrl(coverMedia) === coverUrl
      ? isImageMedia(coverMedia)
      : !isVideoUrl(coverUrl)
    : true;

  const cover: RenderMedia | null = coverUrl
    ? {
        id: coverMedia?.id || 'cover',
        url: coverUrl,
        thumbnailUrl: coverMedia?.thumbnailUrl || null,
        alt: invitation.name,
        isCover: true,
        isImage: coverIsImage
      }
    : null;

  /* --- guest ------------------------------------------------------------ */
  let renderGuest: RenderGuest | null = null;
  if (guest) {
    const name = text(guest.name);
    renderGuest = {
      id: guest.id,
      name,
      firstName: name ? name.split(/\s+/)[0] : '',
      nameClass: nameLengthClass(name, 26, 40),
      groupName: guest.groupName ?? null,
      mobile: guest.mobile ?? null,
      email: guest.email ?? null,
      personalToken: guest.personalToken,
      assignedEventIds,
      hasEventAssignments: hasAssignments
    };
  }

  /* --- rsvp ------------------------------------------------------------- */
  let rsvp: RenderRsvp | null = null;
  if (guest?.rsvp) {
    rsvp = {
      response: text(guest.rsvp.response) || 'PENDING',
      guestsCount: Number(guest.rsvp.guestsCount) || 1,
      message: guest.rsvp.message ?? null,
      dietary: guest.rsvp.dietary ?? null,
      respondedAt: guest.rsvp.respondedAt ?? null
    };
  }

  const features = (asRecord(template?.features) || {}) as Record<string, boolean>;

  const editableFields: Record<string, EditableField> = {};
  for (const [key, value] of Object.entries(asRecord(template?.editableFields))) {
    if (value && typeof value === 'object') editableFields[key] = value as EditableField;
  }

  return {
    template: {
      id: template?.id || '',
      name: text(template?.name) || 'Invitation',
      slug: text(template?.slug),
      version: text(template?.version) || '1.0.0',
      status: text(template?.status) || 'PUBLISHED',
      isPremium: Boolean(template?.isPremium),
      impl: config.impl || 'default',
      variant: config.variant || 'default',
      features,
      design,
      editableFields,
      sections
    },
    invitation: {
      id: invitation.id,
      name: invitation.name,
      slug: invitation.slug,
      description: invitation.description ?? null,
      status: invitation.status,
      isPersonalized: Boolean(invitation.isPersonalized || invitation.personalizationEnabled),
      personalizationEnabled: Boolean(invitation.personalizationEnabled),
      hostName: text(invitation.user?.name),
      coverImageUrl: invitation.coverImageUrl ?? null,
      url: input.pageUrl || '',
      content
    },
    variables,
    events,
    eventScope: hasAssignments ? 'assigned' : 'all',
    gallery,
    cover,
    primaryEvent,
    guest: renderGuest,
    rsvp,
    isPersonalized: Boolean(invitation.isPersonalized || invitation.personalizationEnabled)
  };
}

/**
 * Resolves the design implementation for a template slug. Unknown templates
 * fall back to a generic implementation so an invitation always renders.
 */
export function templateImplOf(template?: TemplateSummary | null): string {
  if (!template) return 'default';
  const config = asRecord(template.config);
  return text(config.impl) || 'default';
}
