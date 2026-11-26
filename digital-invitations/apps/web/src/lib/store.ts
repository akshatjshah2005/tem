'use client';

/**
 * Local data store shared by the editor, the Love Story builder, the public invitation
 * page and the dashboard. It lives in this browser's localStorage, so it works without
 * the API/database; when the API is connected these records can be synced to it.
 */
import { useEffect, useState } from 'react';
import type { InviteContent } from './functions';
import type { LoveStory } from './love-story';

export type StoredGuest = { id: string; name: string; phone: string; group: string; eventIds: string[]; sentAt?: string };

type Base = { id: string; slug: string; title: string; ownerId: string; status: 'PUBLISHED' | 'DRAFT'; createdAt: string; updatedAt: string };
export type StoredInvite = Base & { kind: 'invite'; content: InviteContent; guests: StoredGuest[]; personalize: boolean; waTemplate: string };
export type StoredStory = Base & { kind: 'love'; story: LoveStory };
export type StoredItem = StoredInvite | StoredStory;

export type RsvpRecord = {
  id: string;
  inviteId: string;
  guestId?: string;
  name: string;
  phone?: string;
  attending: boolean;
  count: number;
  diet: string;
  message: string;
  eventNames: string[];
  createdAt: string;
  updatedAt?: string;
};

type Db = { items: StoredItem[]; rsvps: RsvpRecord[] };

const KEY = 'uptemp-db-v1';
const EVENT = 'uptemp-db-change';

const empty = (): Db => ({ items: [], rsvps: [] });

function read(): Db {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const db = JSON.parse(raw) as Db;
    return { items: Array.isArray(db.items) ? db.items : [], rsvps: Array.isArray(db.rsvps) ? db.rsvps : [] };
  } catch {
    return empty();
  }
}

function write(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db)); // throws QuotaExceededError when photos are too large
  window.dispatchEvent(new Event(EVENT));
}

export const uid = (p: string) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function slugify(text: string) {
  const base = text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40) || 'invitation';
  return base + '-' + Math.random().toString(36).slice(2, 6);
}

/* ---------- reads ---------- */
export const getItems = () => read().items;
export const getItem = (idOrSlug: string) => read().items.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
export const getRsvps = () => read().rsvps;

/** Re-renders whenever the store changes (in this tab or another one). */
export function useStore() {
  const [db, setDb] = useState<Db>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setDb(read());
    sync();
    setReady(true);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) sync(); };
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', onStorage); };
  }, []);
  return { ...db, ready };
}

/* ---------- writes ---------- */
type InviteInput = Omit<StoredInvite, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'kind'> & { id?: string };
type StoryInput = Omit<StoredStory, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'kind'> & { id?: string };

function upsert(item: StoredItem) {
  const db = read();
  const i = db.items.findIndex((x) => x.id === item.id);
  if (i >= 0) db.items[i] = item; else db.items.unshift(item);
  write(db);
  return item;
}

export function saveInvite(input: InviteInput): StoredInvite {
  const now = new Date().toISOString();
  const prev = input.id ? getItem(input.id) : undefined;
  return upsert({
    ...input,
    kind: 'invite',
    id: prev?.id || uid('inv'),
    slug: prev?.slug || slugify(input.title),
    createdAt: prev?.createdAt || now,
    updatedAt: now,
  }) as StoredInvite;
}

export function saveStory(input: StoryInput): StoredStory {
  const now = new Date().toISOString();
  const prev = input.id ? getItem(input.id) : undefined;
  return upsert({
    ...input,
    kind: 'love',
    id: prev?.id || uid('story'),
    slug: prev?.slug || slugify(input.title),
    createdAt: prev?.createdAt || now,
    updatedAt: now,
  }) as StoredStory;
}

export function updateItem(id: string, patch: Partial<StoredInvite> | Partial<StoredStory>) {
  const db = read();
  db.items = db.items.map((i) => (i.id === id ? ({ ...i, ...patch, updatedAt: new Date().toISOString() } as StoredItem) : i));
  write(db);
}

export function deleteItem(id: string) {
  const db = read();
  db.items = db.items.filter((i) => i.id !== id);
  db.rsvps = db.rsvps.filter((r) => r.inviteId !== id);
  write(db);
}

export function duplicateItem(id: string) {
  const src = getItem(id);
  if (!src) return;
  const now = new Date().toISOString();
  const copy = { ...structuredClone(src), id: uid(src.kind === 'love' ? 'story' : 'inv'), slug: slugify(src.title), title: src.title + ' (copy)', status: 'DRAFT' as const, createdAt: now, updatedAt: now };
  const db = read();
  db.items.unshift(copy);
  write(db);
  return copy;
}

export function markGuestSent(inviteId: string, guestId: string) {
  const item = getItem(inviteId);
  if (!item || item.kind !== 'invite') return;
  updateItem(inviteId, { guests: item.guests.map((g) => (g.id === guestId ? { ...g, sentAt: new Date().toISOString() } : g)) });
}

/** One RSVP per guest link: a guest answering again updates their earlier reply. */
export function addRsvp(r: Omit<RsvpRecord, 'id' | 'createdAt'>) {
  const db = read();
  const now = new Date().toISOString();
  const existing = r.guestId ? db.rsvps.find((x) => x.inviteId === r.inviteId && x.guestId === r.guestId) : undefined;
  if (existing) Object.assign(existing, r, { updatedAt: now });
  else db.rsvps.unshift({ ...r, id: uid('rsvp'), createdAt: now });
  write(db);
}

export function deleteRsvp(id: string) {
  const db = read();
  db.rsvps = db.rsvps.filter((r) => r.id !== id);
  write(db);
}

/* ---------- links ---------- */
export const inviteUrl = (item: StoredItem, guestId?: string) =>
  (typeof window !== 'undefined' ? window.location.origin : '') + '/v/' + item.slug + (guestId ? '?g=' + encodeURIComponent(guestId) : '');
