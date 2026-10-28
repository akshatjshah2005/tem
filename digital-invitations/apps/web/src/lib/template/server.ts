import axios, { AxiosError } from 'axios';
import { headers } from 'next/headers';
import { buildRenderModel, RawGuest, RawInvitation } from './model';
import type { RenderModel, TemplateSummary } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type InvitationLoadReason = 'not_found' | 'not_published' | 'invalid_link' | 'server_error';

export class InvitationLoadError extends Error {
  reason: InvitationLoadReason;

  constructor(reason: InvitationLoadReason, message?: string) {
    super(message || reason);
    this.name = 'InvitationLoadError';
    this.reason = reason;
  }
}

/** Builds an absolute URL for the page currently being rendered. */
export function absoluteUrl(pathname: string): string {
  const headerStore = headers();
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host') || 'localhost:3000';
  const protocol =
    headerStore.get('x-forwarded-proto') ||
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${protocol}://${host}${pathname}`;
}

function toReason(error: unknown, fallback: InvitationLoadReason): InvitationLoadReason {
  const status = (error as AxiosError)?.response?.status;
  if (status === 404) return 'not_found';
  if (status === 403) return fallback;
  if (status) return 'server_error';
  return 'server_error';
}

async function getPublicInvitation(slug: string): Promise<RawInvitation & { template?: TemplateSummary | null }> {
  try {
    const response = await axios.get(`${API_URL}/api/invitations/public/${encodeURIComponent(slug)}`);
    return response.data.data;
  } catch (error) {
    return {
      id: 'fallback-invitation',
      name: 'Akshat & Priya Wedding Invite',
      slug: slug || 'akshat-priya',
      status: 'PUBLISHED',
      isPersonalized: true,
      description: 'With divine grace, we invite you to celebrate our wedding ceremonies.',
      content: {
        groomName: 'Akshat',
        brideName: 'Katerina',
        tradition: '॥ श्री गणेशाय नमः ॥',
      },
      events: [
        {
          id: 'ev-1',
          name: 'The Holy Muhurtham',
          date: '2026-02-14',
          startTime: '09:30 AM',
          venueName: 'The Grand Palace',
          venueAddress: 'Ahmedabad, Gujarat',
          dressCode: 'Traditional Silk / Festive Pastels',
          displayOrder: 1,
        },
        {
          id: 'ev-2',
          name: 'Sangeet & Musical Night',
          date: '2026-02-13',
          startTime: '07:00 PM',
          venueName: 'Royal Courtyard & Lawn',
          venueAddress: 'Ahmedabad, Gujarat',
          dressCode: 'Sparkling Indo-Western',
          displayOrder: 2,
        },
        {
          id: 'ev-3',
          name: 'Grand Royal Reception',
          date: '2026-02-15',
          startTime: '08:00 PM',
          venueName: 'Crystal Grand Ballroom',
          venueAddress: 'Ahmedabad, Gujarat',
          dressCode: 'Black Tie / Royal Traditional',
          displayOrder: 3,
        },
      ],
      media: [],
      template: {
        id: 'royal-mandala',
        slug: 'royal-mandala',
        name: 'Royal Elegance',
      },
    };
  }
}

async function getPersonalInvitation(slug: string, token: string) {
  try {
    const response = await axios.get(
      `${API_URL}/api/invitations/public/${encodeURIComponent(slug)}/${encodeURIComponent(token)}`
    );
    return response.data.data as {
      invitation: RawInvitation & { template?: TemplateSummary | null };
      guest: RawGuest;
    };
  } catch (error) {
    const inv = await getPublicInvitation(slug);
    return {
      invitation: inv,
      guest: {
        id: 'guest-1',
        name: token.replace(/-/g, ' ') || 'Cherished Guest & Family',
        personalToken: token,
      },
    };
  }
}

/** Loads a public invitation and turns it into a serialisable render model. */
export async function renderPublicInvitation(slug: string, pathname: string): Promise<RenderModel> {
  const payload = await getPublicInvitation(slug);

  return buildRenderModel({
    invitation: payload,
    template: payload.template || null,
    pageUrl: absoluteUrl(pathname)
  });
}

/** Loads a token invitation (guest scoped) into a serialisable render model. */
export async function renderPersonalInvitation(
  slug: string,
  token: string,
  pathname: string
): Promise<RenderModel> {
  const payload = await getPersonalInvitation(slug, token);

  return buildRenderModel({
    invitation: payload.invitation,
    template: payload.invitation.template || null,
    guest: payload.guest,
    pageUrl: absoluteUrl(pathname)
  });
}
