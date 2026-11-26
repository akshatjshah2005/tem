'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import CinematicInvite, { type SceneFocus, type SceneKind } from '@/components/cinematic/CinematicInvite';
import DeviceFrame, { DeviceToggle, type DeviceView } from '@/components/cinematic/DeviceFrame';
import { TemplateThumb } from '@/components/ui/TemplateCard';
import Icon, { type IconName } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { getItem, inviteUrl, saveInvite, type StoredInvite } from '@/lib/store';
import {
  FUNCTIONS, MUSIC, defaultContent, displayNames, formatDate, formatTime, getFunction, getTemplate, newId,
  resolveFunctionId, templatesFor, type FunctionId, type InviteContent, type InviteEvent,
} from '@/lib/functions';
import './create.css';

type Guest = { id: string; name: string; phone: string; group: string; eventIds: string[] };
type Draft = { content: InviteContent; guests: Guest[]; personalize: boolean; waTemplate: string; title: string };

const DRAFT_KEY = 'uptemp-create-v2';
const GROUPS = ['Family', 'Relatives', 'Friends', 'Colleagues', 'Neighbours', 'VIP'];
const BLESSINGS = ['॥ श्री गणेशाय नमः ॥', '॥ शुभ लाभ ॥', '॥ ॐ श्री महावीराय नमः ॥', 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ', 'Bismillah-ir-Rahman-ir-Rahim', 'With love'];
const JOINERS = [{ v: '&', l: 'A & B' }, { v: 'weds', l: 'A weds B' }, { v: '♥', l: 'A ♥ B' }, { v: '', l: 'Second line below' }];
const STEPS = ['Occasion & design', 'Details', 'Functions', 'Photos & music', 'Guests & share'];
const STEP_ICONS: IconName[] = ['palette', 'pen', 'calendar-days', 'camera', 'users'];
const DEFAULT_WA = 'Namaste {guest_name},\n\nWith joy we invite you to {headline} — {names}.\n\n{functions}\n\nYour personal invitation: {link}';

const sampleGuests = (events: InviteEvent[]): Guest[] => [
  { id: 'g-sample-1', name: 'Sharma Family', phone: '', group: 'Family', eventIds: events.map((e) => e.id) },
  { id: 'g-sample-2', name: 'Rahul Mehta', phone: '', group: 'Friends', eventIds: events.slice(-1).map((e) => e.id) },
];

/* ---------- undo / redo history ---------- */
function useHistory<T>(initial: T) {
  const [h, setH] = useState({ past: [] as T[], present: initial, future: [] as T[] });
  const last = useRef(0);
  const set = useCallback((updater: (p: T) => T, opts?: { reset?: boolean; coalesce?: boolean }) => {
    setH((s) => {
      const next = updater(s.present);
      if (next === s.present) return s;
      if (opts?.reset) return { past: [], present: next, future: [] };
      const now = Date.now();
      const merge = opts?.coalesce !== false && now - last.current < 900;
      last.current = now;
      return { past: merge ? s.past : [...s.past.slice(-49), s.present], present: next, future: [] };
    });
  }, []);
  const undo = useCallback(() => setH((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s)), []);
  const redo = useCallback(() => setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s)), []);
  return { value: h.present, set, undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}

/* ---------- helpers ---------- */
function resizeImage(file: File, max = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell.trim()); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const cleanPhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  return d.length === 10 ? '91' + d : d;
};

function fillMessage(tpl: string, c: InviteContent, g: Guest | undefined, personalize: boolean, link?: string) {
  const evs = personalize && g ? c.events.filter((e) => g.eventIds.includes(e.id)) : c.events;
  const lines = evs.map((e) => '• ' + e.name + ' — ' + formatDate(e.date, { day: 'numeric', month: 'short' }) + ', ' + formatTime(e.time) + (e.venue ? ', ' + e.venue : '')).join('\n');
  return tpl
    .replaceAll('{guest_name}', g?.name || 'friends')
    .replaceAll('{names}', displayNames(c))
    .replaceAll('{headline}', c.headline)
    .replaceAll('{functions}', lines)
    .replaceAll('{link}', link || '[private link — created when you publish]');
}

/* ---------- component ---------- */
function Studio() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [inviteId, setInviteId] = useState<string | null>(params?.get('edit') || null);
  const [published, setPublished] = useState<StoredInvite | null>(null);

  const urlTemplate = getTemplate(params?.get('template'));
  const urlFn: FunctionId = resolveFunctionId(params?.get('category')) || urlTemplate?.functionId || 'wedding';
  const initialContent = useMemo(() => defaultContent(urlFn, urlTemplate?.id), [urlFn, urlTemplate?.id]);

  const history = useHistory<InviteContent>(initialContent);
  const content = history.value;
  const setContent = history.set;
  const [guests, setGuests] = useState<Guest[]>(() => sampleGuests(initialContent.events));
  const [personalize, setPersonalize] = useState(true);
  const [waTemplate, setWaTemplate] = useState(DEFAULT_WA);
  const [title, setTitle] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [step, setStep] = useState(0);
  const [view, setView] = useState<DeviceView>('phone');
  const [replayKey, setReplayKey] = useState(0);
  const [focus, setFocus] = useState<SceneFocus | null>(null);
  const [previewGuestId, setPreviewGuestId] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'edit' | 'preview'>('edit');
  const [fullscreen, setFullscreen] = useState(false);
  const [openEventId, setOpenEventId] = useState<string | null>(initialContent.events[0]?.id || null);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', group: 'Family' });
  const [importRows, setImportRows] = useState<{ name: string; phone: string; group: string; ok: boolean }[] | null>(null);

  const fn = getFunction(content.functionId);
  const template = getTemplate(content.templateId) || templatesFor(content.functionId)[0];
  const previewGuest = guests.find((g) => g.id === previewGuestId);

  /* load draft once */
  useEffect(() => {
    try {
      const editing = inviteId ? getItem(inviteId) : undefined;
      const raw = editing ? null : localStorage.getItem(DRAFT_KEY);
      if (editing?.kind === 'invite') {
        setContent(() => ({ ...defaultContent(editing.content.functionId), ...editing.content }), { reset: true });
        setGuests(editing.guests);
        setPersonalize(editing.personalize);
        setWaTemplate(editing.waTemplate || DEFAULT_WA);
        setTitle(editing.title);
        setOpenEventId(editing.content.events[0]?.id || null);
        setPublished(editing);
        toast.success('Editing “' + editing.title + '”', { id: 'restored' });
      } else if (inviteId) {
        setInviteId(null);
      }
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d?.content?.functionId === urlFn) {
          const templateId = urlTemplate && urlTemplate.functionId === urlFn ? urlTemplate.id : d.content.templateId;
          setContent(() => ({ ...defaultContent(urlFn), ...d.content, templateId }), { reset: true });
          setGuests(d.guests || []);
          setPersonalize(d.personalize ?? true);
          setWaTemplate(d.waTemplate || DEFAULT_WA);
          setTitle(d.title || '');
          setOpenEventId(d.content.events[0]?.id || null);
          toast.success('Welcome back — your draft is restored', { id: 'restored' });
        }
      }
    } catch { /* ignore corrupt drafts */ }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* autosave (debounced) */
  useEffect(() => {
    if (!hydrated) return;
    setSaveState('saving');
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, guests, personalize, waTemplate, title } satisfies Draft));
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [content, guests, personalize, waTemplate, title, hydrated]);

  /* keep the URL in sync without remounting */
  useEffect(() => {
    if (!hydrated) return;
    const q = new URLSearchParams({ template: content.templateId, category: content.functionId });
    if (inviteId) q.set('edit', inviteId);
    window.history.replaceState(null, '', '/create?' + q.toString());
  }, [content.templateId, content.functionId, hydrated, inviteId]);

  /* keyboard undo/redo outside text fields; Esc closes fullscreen */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      const typing = (e.target as HTMLElement).closest('input, textarea, select');
      if (typing || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) history.redo(); else history.undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history]);

  const show = (kind: SceneKind, index?: number) => setFocus({ kind, index, nonce: Date.now() });
  const set = <K extends keyof InviteContent>(key: K, value: InviteContent[K]) => setContent((c) => ({ ...c, [key]: value }));

  /* ----- occasion & template ----- */
  const changeFunction = (id: FunctionId) => {
    if (id === content.functionId) return;
    const next = defaultContent(id);
    setContent((c) => ({ ...next, coverPhoto: c.coverPhoto, photos: c.photos }), { coalesce: false });
    setGuests((gs) => gs.map((g) => ({ ...g, eventIds: next.events.map((e) => e.id) })));
    setOpenEventId(next.events[0]?.id || null);
    setReplayKey((k) => k + 1);
    toast.success(getFunction(id).label + ' selected — sample details loaded. Your photos and guests are kept.');
  };
  const changeTemplate = (id: string) => {
    if (id === content.templateId) return;
    setContent((c) => ({ ...c, templateId: id }), { coalesce: false });
    setReplayKey((k) => k + 1);
  };

  /* ----- events ----- */
  const updateEvent = (id: string, patch: Partial<InviteEvent>) => setContent((c) => ({ ...c, events: c.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const addEvent = (name: string) => {
    const last = content.events[content.events.length - 1];
    const e: InviteEvent = { id: newId(), name, date: last?.date || '', time: '11:00', venue: last?.venue || '', address: last?.address || '', dressCode: '', note: '' };
    setContent((c) => ({ ...c, events: [...c.events, e] }), { coalesce: false });
    setGuests((gs) => gs.map((g) => ({ ...g, eventIds: [...g.eventIds, e.id] })));
    setOpenEventId(e.id);
    show('event', content.events.length);
  };
  const removeEvent = (id: string) => {
    if (content.events.length <= 1) { toast.error('Keep at least one function.'); return; }
    setContent((c) => ({ ...c, events: c.events.filter((e) => e.id !== id) }), { coalesce: false });
    setGuests((gs) => gs.map((g) => ({ ...g, eventIds: g.eventIds.filter((x) => x !== id) })));
  };
  const moveEvent = (id: string, dir: -1 | 1) => setContent((c) => {
    const i = c.events.findIndex((e) => e.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= c.events.length) return c;
    const events = [...c.events];
    [events[i], events[j]] = [events[j], events[i]];
    return { ...c, events };
  }, { coalesce: false });

  /* ----- media ----- */
  const onCover = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8_000_000) { toast.error('Choose a JPG, PNG or WebP photo under 8 MB.'); return; }
    try { set('coverPhoto', await resizeImage(file)); show('photo'); toast.success('Cover photo added'); } catch { toast.error('This photo could not be opened.'); }
  };
  const onGallery = async (files: FileList | null) => {
    if (!files) return;
    const room = 4 - content.photos.length;
    if (room <= 0) { toast.error('The gallery holds 4 photos. Remove one to add another.'); return; }
    const picked = Array.from(files).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type) && f.size <= 8_000_000).slice(0, room);
    if (!picked.length) { toast.error('Choose JPG, PNG or WebP photos under 8 MB.'); return; }
    try {
      const urls = await Promise.all(picked.map((f) => resizeImage(f, 900)));
      setContent((c) => ({ ...c, photos: [...c.photos, ...urls].slice(0, 4), showGallery: true }), { coalesce: false });
      show('gallery');
    } catch { toast.error('One of the photos could not be opened.'); }
  };

  /* ----- guests ----- */
  const addGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGuest.name.trim();
    if (!name) return;
    const g: Guest = { id: newId('g'), name, phone: newGuest.phone.trim(), group: newGuest.group, eventIds: content.events.map((x) => x.id) };
    setGuests((gs) => [g, ...gs]);
    setNewGuest({ name: '', phone: '', group: newGuest.group });
    setPreviewGuestId(g.id);
    toast.success(name + ' added with every function');
  };
  const onImport = async (file?: File) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) { toast.error('Upload a .csv file. In Excel use File → Save As → CSV.'); return; }
    const rows = parseCsv(await file.text());
    if (!rows.length) { toast.error('That file looks empty.'); return; }
    const header = rows[0].map((h) => h.toLowerCase());
    const hasHeader = header.some((h) => /name/.test(h));
    const col = (re: RegExp, fallback: number) => { const i = header.findIndex((h) => re.test(h)); return hasHeader && i >= 0 ? i : fallback; };
    const ni = col(/name/, 0), pi = col(/phone|mobile|whatsapp|number/, 1), gi = col(/group|family|category|relation/, 2);
    const data = (hasHeader ? rows.slice(1) : rows).slice(0, 500).map((r) => {
      const name = (r[ni] || '').trim();
      const phone = (r[pi] || '').trim();
      const digits = phone.replace(/\D/g, '');
      return { name, phone, group: (r[gi] || 'Family').trim() || 'Family', ok: !!name && (!phone || (digits.length >= 10 && digits.length <= 13)) };
    });
    setImportRows(data);
  };
  const confirmImport = () => {
    if (!importRows) return;
    const ok = importRows.filter((r) => r.ok);
    setGuests((gs) => [...ok.map((r) => ({ id: newId('g'), name: r.name, phone: r.phone, group: r.group, eventIds: content.events.map((e) => e.id) })), ...gs]);
    toast.success(ok.length + ' guests added');
    setImportRows(null);
  };
  const toggleGuestEvent = (gid: string, eid: string) => setGuests((gs) => gs.map((g) => g.id !== gid ? g : { ...g, eventIds: g.eventIds.includes(eid) ? g.eventIds.filter((x) => x !== eid) : [...g.eventIds, eid] }));
  const sendWhatsApp = (g: Guest) => {
    const text = encodeURIComponent(fillMessage(waTemplate, content, g, personalize, published ? inviteUrl(published, personalize ? g.id : undefined) : undefined));
    const phone = cleanPhone(g.phone);
    window.open('https://wa.me/' + (phone || '') + '?text=' + text, '_blank', 'noopener');
  };

  const publish = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, guests, personalize, waTemplate, title } satisfies Draft)); } catch { /* shown by autosave */ }
    if (!user) {
      toast('Sign in to publish — your draft is saved in this browser.', { icon: null });
      router.push('/login?next=' + encodeURIComponent('/create?template=' + content.templateId + '&category=' + content.functionId));
      return;
    }
    try {
      const saved = saveInvite({ id: inviteId || undefined, title: title.trim() || displayNames(content) + ' · ' + fn.short, ownerId: user.id, status: 'PUBLISHED', content, guests, personalize, waTemplate });
      setInviteId(saved.id);
      setPublished(saved);
      toast.success(inviteId ? 'Changes published' : 'Published! Guest links are ready on your dashboard.');
      router.push('/dashboard?published=' + saved.id);
    } catch {
      toast.error('Couldn’t publish — remove a large photo and try again.');
    }
  };

  const goStep = (i: number) => {
    const s = Math.max(0, Math.min(STEPS.length - 1, i));
    setStep(s);
    setMobilePanel('edit');
    document.querySelector('.cs-panel-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    if (s === 1) show('title');
    if (s === 2) show('event', 0);
    if (s === 3) show(content.coverPhoto ? 'photo' : 'message');
    if (s === 4) show('title');
  };

  const statusText = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved in this browser' : saveState === 'error' ? 'Couldn’t save — remove a large photo' : '';
  const previewName = personalize && previewGuest ? previewGuest.name : undefined;
  const previewEvents = personalize && previewGuest ? previewGuest.eventIds : undefined;

  const invite = (
    <CinematicInvite
      key={replayKey}
      content={content}
      template={template}
      guestName={previewName}
      visibleEventIds={previewEvents}
      focus={focus}
      previewLabel
      onRsvp={() => 'RSVP preview works! Real replies are collected once you publish.'}
    />
  );

  return (
    <div className="cs">
      <header className="cs-top">
        <Link href="/" className="cs-logo" aria-label="uptemp home"><span className="cs-logo-mark" aria-hidden="true"><i /><i /></span></Link>
        <div className="cs-project">
          <input aria-label="Invitation name" value={title} placeholder={displayNames(content) + ' · ' + fn.short} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          <small className={'cs-save cs-save-' + saveState}>{statusText}</small>
        </div>
        <div className="cs-top-actions">
          <button type="button" className="cs-icon" onClick={history.undo} disabled={!history.canUndo} aria-label="Undo" title="Undo (Ctrl+Z)"><Icon name="undo" /></button>
          <button type="button" className="cs-icon" onClick={history.redo} disabled={!history.canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><Icon name="redo" /></button>
          <button type="button" className="cs-btn cs-btn-ghost cs-hide-sm" onClick={() => setFullscreen(true)}><Icon name="maximize" /> Preview</button>
          <button type="button" className="cs-btn cs-btn-primary" onClick={publish}>Publish</button>
        </div>
      </header>

      <div className={'cs-body cs-show-' + mobilePanel}>
        <nav className="cs-steps" aria-label="Steps" style={{ '--p': step / (STEPS.length - 1) } as React.CSSProperties}>
          <p className="cs-steps-title">Your invitation</p>
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => goStep(i)} aria-current={i === step ? 'step' : undefined} data-done={i < step || undefined}>
              <span>{i < step ? <Icon name="check" /> : <Icon name={STEP_ICONS[i]} />}</span><em>{s}</em>
            </button>
          ))}
          <div className="cs-steps-meta">
            <small>Step {step + 1} of {STEPS.length}</small>
            <i aria-hidden="true"><b /></i>
          </div>
        </nav>

        <aside className="cs-panel" aria-label="Edit invitation">
          <div className="cs-panel-scroll" key={step}>
            {step === 0 && (
              <>
                <h2>What are you celebrating?</h2>
                <p className="cs-lead">Choose the occasion — names, wording and sample functions adapt to it.</p>
                <div className="cs-fns">
                  {FUNCTIONS.map((f) => (
                    <button key={f.id} type="button" aria-pressed={content.functionId === f.id} onClick={() => changeFunction(f.id)}>
                      <span className="cs-fn-icon"><Icon name={f.icon} /></span>{f.label}
                    </button>
                  ))}
                </div>
                <h3>Choose a design</h3>
                <p className="cs-hint">Switching designs keeps everything you’ve written.</p>
                <div className="cs-designs">
                  {templatesFor(content.functionId).map((t) => (
                    <button key={t.id} type="button" className="cs-design" aria-pressed={content.templateId === t.id} onClick={() => changeTemplate(t.id)}>
                      <TemplateThumb template={t} pill={false} />
                      <strong>{t.name}</strong>
                      <small>{t.description}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2>Your details</h2>
                <p className="cs-lead">Click into any field — the preview jumps to that scene.</p>
                <label className="cs-label">Blessing at the top</label>
                <div className="cs-chips">
                  {BLESSINGS.map((b) => <button key={b} type="button" aria-pressed={content.blessing === b} onClick={() => { set('blessing', b); show('title'); }}>{b}</button>)}
                </div>
                <input className="cs-input" aria-label="Blessing" value={content.blessing} onFocus={() => show('title')} onChange={(e) => set('blessing', e.target.value)} />
                <Field label="Headline" value={content.headline} onFocus={() => show('title')} onChange={(v) => set('headline', v)} max={60} />
                <div className="cs-row">
                  <Field label={fn.name1Label} value={content.name1} onFocus={() => show('title')} onChange={(v) => set('name1', v)} max={40} />
                  <Field label={fn.name2Label} hint={fn.name2Hint} value={content.name2} onFocus={() => show('title')} onChange={(v) => set('name2', v)} max={40} />
                </div>
                <label className="cs-label" htmlFor="cs-joiner">Show names as</label>
                <select id="cs-joiner" className="cs-input" value={content.joiner} onFocus={() => show('title')} onChange={(e) => set('joiner', e.target.value)}>
                  {JOINERS.map((j) => <option key={j.l} value={j.v}>{j.l}</option>)}
                </select>
                <Field label="Family / hosts line" value={content.family} onFocus={() => show('message')} onChange={(v) => set('family', v)} max={140} />
                <Field label="Invitation message" multiline value={content.message} onFocus={() => show('message')} onChange={(v) => set('message', v)} max={280} />
                <Field label="Closing line" value={content.closing} onFocus={() => show('closing')} onChange={(v) => set('closing', v)} max={120} />
              </>
            )}

            {step === 2 && (
              <>
                <h2>Functions</h2>
                <p className="cs-lead">{content.events.length} {content.events.length === 1 ? 'function' : 'functions'} · each becomes its own scene.</p>
                <div className="cs-events">
                  {content.events.map((e, i) => {
                    const open = openEventId === e.id;
                    return (
                      <div key={e.id} className="cs-event" data-open={open}>
                        <div className="cs-event-head">
                          <button type="button" className="cs-event-toggle" aria-expanded={open} onClick={() => { setOpenEventId(open ? null : e.id); show('event', i); }}>
                            <span className="cs-num">{i + 1}</span>
                            <span><strong>{e.name || 'Untitled function'}</strong><small>{formatDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' })}{e.time ? ' · ' + formatTime(e.time) : ''}</small></span>
                          </button>
                          <button type="button" className="cs-icon cs-icon-sm" onClick={() => moveEvent(e.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                          <button type="button" className="cs-icon cs-icon-sm" onClick={() => moveEvent(e.id, 1)} disabled={i === content.events.length - 1} aria-label="Move down">↓</button>
                          <button type="button" className="cs-icon cs-icon-sm cs-danger" onClick={() => removeEvent(e.id)} aria-label={'Remove ' + e.name}><Icon name="trash" /></button>
                        </div>
                        {open && (
                          <div className="cs-event-body">
                            <Field label="Function name" value={e.name} list="cs-presets" onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { name: v })} max={50} />
                            <div className="cs-row">
                              <Field label="Date" type="date" value={e.date} onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { date: v })} />
                              <Field label="Time" type="time" value={e.time} onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { time: v })} />
                            </div>
                            <Field label="Venue" value={e.venue} onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { venue: v })} max={80} />
                            <Field label="Address (used for directions)" value={e.address} onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { address: v })} max={140} />
                            <Field label="Dress code (optional)" value={e.dressCode} onFocus={() => show('event', i)} onChange={(v) => updateEvent(e.id, { dressCode: v })} max={60} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <datalist id="cs-presets">{fn.eventPresets.map((p) => <option key={p} value={p} />)}</datalist>
                <label className="cs-label">Add a function</label>
                <div className="cs-chips">
                  {fn.eventPresets.map((p) => <button key={p} type="button" onClick={() => addEvent(p)}><Icon name="plus" /> {p}</button>)}
                  <button type="button" onClick={() => addEvent('Custom function')}><Icon name="plus" /> Custom</button>
                </div>
                <h3>Extras</h3>
                <Toggle label="Countdown to the first function" checked={content.showCountdown} onChange={(v) => { set('showCountdown', v); if (v) show('countdown'); }} />
                <Toggle label="RSVP — guests confirm attendance" checked={content.showRsvp} onChange={(v) => { set('showRsvp', v); if (v) show('rsvp'); }} />
              </>
            )}

            {step === 3 && (
              <>
                <h2>Photos & music</h2>
                <p className="cs-lead">Photos are resized in your browser before they’re added.</p>
                <label className="cs-label">Cover photo</label>
                {content.coverPhoto ? (
                  <div className="cs-cover">
                    <img src={content.coverPhoto} alt="Cover" />
                    <div><button type="button" className="cs-btn cs-btn-ghost" onClick={() => show('photo')}>Show in preview</button><button type="button" className="cs-btn cs-btn-ghost cs-danger" onClick={() => set('coverPhoto', '')}>Remove</button></div>
                  </div>
                ) : (
                  <label className="cs-drop"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { void onCover(e.target.files?.[0]); e.target.value = ''; }} /><span><Icon name="upload" /></span><strong>Upload a cover photo</strong><small>JPG, PNG or WebP</small></label>
                )}
                <label className="cs-label">Gallery ({content.photos.length}/4)</label>
                <div className="cs-gallery">
                  {content.photos.map((p, i) => (
                    <div key={i}><img src={p} alt={'Gallery photo ' + (i + 1)} /><button type="button" aria-label={'Remove photo ' + (i + 1)} onClick={() => set('photos', content.photos.filter((_, j) => j !== i))}><Icon name="close" /></button></div>
                  ))}
                  {content.photos.length < 4 && <label className="cs-drop cs-drop-sm"><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { void onGallery(e.target.files); e.target.value = ''; }} /><span><Icon name="plus" /></span></label>}
                </div>
                <Toggle label="Show the gallery scene" checked={content.showGallery} onChange={(v) => set('showGallery', v)} />
                <h3>Music</h3>
                <select className="cs-input" aria-label="Background music" value={content.music} onChange={(e) => set('music', e.target.value)}>
                  {MUSIC.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <p className="cs-hint">Guests tap the speaker button in the invitation to play music — it never starts with sound on its own.</p>
              </>
            )}

            {step === 4 && (
              <>
                <h2>Guests & sharing</h2>
                <p className="cs-lead">Each guest gets a private link with their name and only their functions.</p>
                <Toggle label="Personalize for each guest (name + functions)" checked={personalize} onChange={setPersonalize} />

                <form className="cs-addguest" onSubmit={addGuest}>
                  <input className="cs-input" placeholder="Guest or family name" aria-label="Guest name" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} maxLength={60} />
                  <input className="cs-input" placeholder="WhatsApp number" aria-label="WhatsApp number" inputMode="tel" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} maxLength={16} />
                  <select className="cs-input" aria-label="Group" value={newGuest.group} onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value })}>{GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
                  <button type="submit" className="cs-btn cs-btn-primary">Add</button>
                </form>
                <label className="cs-import"><input type="file" accept=".csv,text/csv" onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = ''; }} /><span>⬆ Import guest list (CSV)</span><small>Columns: name, phone, group — in Excel use Save As → CSV</small></label>

                {importRows && (
                  <div className="cs-review">
                    <p><strong>Review import</strong> · {importRows.filter((r) => r.ok).length} ready, {importRows.filter((r) => !r.ok).length} need fixing</p>
                    <div className="cs-review-list">
                      {importRows.slice(0, 60).map((r, i) => <div key={i} data-ok={r.ok}><span>{r.name || '(no name)'}</span><span>{r.phone || '—'}</span><span>{r.ok ? r.group : 'Check name/number'}</span></div>)}
                    </div>
                    <div className="cs-row-end"><button type="button" className="cs-btn cs-btn-ghost" onClick={() => setImportRows(null)}>Cancel</button><button type="button" className="cs-btn cs-btn-primary" onClick={confirmImport} disabled={!importRows.some((r) => r.ok)}>Add {importRows.filter((r) => r.ok).length} guests</button></div>
                  </div>
                )}

                <h3>Guest list ({guests.length})</h3>
                {guests.length === 0 && <p className="cs-hint">No guests yet. Add one above or import your list.</p>}
                <div className="cs-guests">
                  {guests.map((g) => (
                    <div key={g.id} className="cs-guest" data-active={previewGuestId === g.id}>
                      <div className="cs-guest-head">
                        <span className="cs-avatar">{g.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                        <span><strong>{g.name}</strong><small>{g.group}{g.phone ? ' · ' + g.phone : ''}</small></span>
                        <button type="button" className="cs-icon cs-icon-sm cs-danger" aria-label={'Remove ' + g.name} onClick={() => { setGuests((gs) => gs.filter((x) => x.id !== g.id)); if (previewGuestId === g.id) setPreviewGuestId(''); }}><Icon name="trash" /></button>
                      </div>
                      {personalize && (
                        <div className="cs-chips cs-chips-sm" role="group" aria-label={'Functions for ' + g.name}>
                          {content.events.map((e) => <button key={e.id} type="button" aria-pressed={g.eventIds.includes(e.id)} onClick={() => toggleGuestEvent(g.id, e.id)}>{e.name}</button>)}
                        </div>
                      )}
                      <div className="cs-guest-actions">
                        <button type="button" onClick={() => { setPreviewGuestId(g.id); setReplayKey((k) => k + 1); setMobilePanel('preview'); }}><Icon name="eye" /> Preview as {g.name.split(' ')[0]}</button>
                        <button type="button" onClick={() => sendWhatsApp(g)}><Icon name="chat" /> WhatsApp</button>
                      </div>
                    </div>
                  ))}
                </div>

                <h3>WhatsApp message</h3>
                <p className="cs-hint">Tap to insert: {['{guest_name}', '{names}', '{headline}', '{functions}', '{link}'].map((v) => <button key={v} type="button" className="cs-var" onClick={() => setWaTemplate((t) => t + ' ' + v)}>{v}</button>)}</p>
                <textarea className="cs-input" rows={6} aria-label="WhatsApp message template" value={waTemplate} onChange={(e) => setWaTemplate(e.target.value)} maxLength={900} />
                <div className="cs-wa">
                  <small>Preview for {previewGuest?.name || guests[0]?.name || 'a guest'}</small>
                  <p>{fillMessage(waTemplate, content, previewGuest || guests[0], personalize)}</p>
                </div>
                <p className="cs-hint">{'{link}'} becomes each guest’s private link after you publish.</p>
                <button type="button" className="cs-btn cs-btn-primary cs-wide" onClick={publish}>Publish & get links →</button>
              </>
            )}
          </div>

          <div className="cs-panel-bar">
            <button type="button" className="cs-btn cs-btn-ghost" onClick={() => goStep(step - 1)} disabled={step === 0}>Back</button>
            <button type="button" className="cs-btn cs-btn-ghost cs-only-sm" onClick={() => setMobilePanel(mobilePanel === 'edit' ? 'preview' : 'edit')}>{mobilePanel === 'edit' ? 'Preview' : 'Edit'}</button>
            {step < STEPS.length - 1
              ? <button type="button" className="cs-btn cs-btn-primary" onClick={() => goStep(step + 1)}>Next: {STEPS[step + 1]}</button>
              : <button type="button" className="cs-btn cs-btn-primary" onClick={publish}>Publish</button>}
          </div>
        </aside>

        <section className="cs-preview" aria-label="Live preview">
          <div className="cs-preview-bar">
            <DeviceToggle view={view} onChange={setView} />
            <select className="cs-select" aria-label="Preview as" value={previewGuestId} onChange={(e) => { setPreviewGuestId(e.target.value); setReplayKey((k) => k + 1); }}>
              <option value="">Preview: common invitation</option>
              {guests.map((g) => <option key={g.id} value={g.id}>Preview as {g.name}</option>)}
            </select>
            <button type="button" className="cs-icon" aria-label="Replay from the opening" title="Replay" onClick={() => setReplayKey((k) => k + 1)}><Icon name="replay" /></button>
            <button type="button" className="cs-icon" aria-label="Full screen preview" title="Full screen" onClick={() => setFullscreen(true)}><Icon name="maximize" /></button>
          </div>
          <div className="cs-stage">
            <DeviceFrame view={view}>{invite}</DeviceFrame>
          </div>
          <p className="cs-stage-note">{template.name} · {fn.label}{previewName ? ' · as ' + previewName : ''}</p>
        </section>
      </div>

      {fullscreen && (
        <div className="cs-full" role="dialog" aria-modal="true" aria-label="Full screen preview">
          <button type="button" className="cs-full-close" onClick={() => setFullscreen(false)}><Icon name="close" /> Close</button>
          <div className="cs-full-phone">
            <CinematicInvite key={'full' + replayKey} content={content} template={template} guestName={previewName} visibleEventIds={previewEvents} previewLabel onRsvp={() => 'RSVP preview works! Real replies are collected once you publish.'} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, onFocus, hint, multiline, type = 'text', max, list }: {
  label: string; value: string; onChange: (v: string) => void; onFocus?: () => void; hint?: string; multiline?: boolean; type?: string; max?: number; list?: string;
}) {
  return (
    <label className="cs-field">
      <span>{label}{max && multiline ? <em>{value.length}/{max}</em> : null}</span>
      {multiline
        ? <textarea className="cs-input" rows={4} value={value} maxLength={max} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} />
        : <input className="cs-input" type={type} value={value} maxLength={max} list={list} placeholder={hint} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="cs-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden="true" />
      {label}
    </label>
  );
}

export default function CreateStudio() {
  return (
    <Suspense fallback={<div className="cs-loading">Loading your studio…</div>}>
      <Studio />
    </Suspense>
  );
}
