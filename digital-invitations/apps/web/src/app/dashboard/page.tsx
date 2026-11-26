'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { SiteShell } from '@/components/ui/Sections';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { defaultContent, displayNames, formatDate, getFunction, getTemplate, templatesFor } from '@/lib/functions';
import {
  addRsvp, deleteItem, deleteRsvp, duplicateItem, inviteUrl, markGuestSent, saveInvite, useStore,
  type RsvpRecord, type StoredGuest, type StoredInvite, type StoredItem,
} from '@/lib/store';
import { buildXlsx, downloadBlob, toCsv, type Sheet } from '@/lib/xlsx';
import './dashboard.css';

type Tab = 'rsvps' | 'guests';
type StatusFilter = 'all' | 'attending' | 'declined' | 'awaiting';

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function ago(iso: string, now: number) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  if (s < 86400 * 7) return Math.floor(s / 86400) + ' d ago';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const editHref = (item: StoredItem) =>
  item.kind === 'love' ? '/love-story?edit=' + item.id + '#builder' : '/create?template=' + item.content.templateId + '&category=' + item.content.functionId + '&edit=' + item.id;

async function copy(text: string, ok: string) {
  try { await navigator.clipboard.writeText(text); toast.success(ok); } catch { toast.error('Couldn’t copy — long-press the link to copy it.'); }
}

/* ---------- sample data so a new host can try every feature ---------- */
function seedSample(ownerId: string) {
  const content = defaultContent('wedding', 'royal-sandalwood');
  const ev = content.events;
  const guests: StoredGuest[] = [
    { id: 'g-s1', name: 'Sharma Family', phone: '9876543210', group: 'Family', eventIds: ev.map((e) => e.id) },
    { id: 'g-s2', name: 'Rahul Mehta', phone: '9812345678', group: 'Friends', eventIds: ev.slice(-2).map((e) => e.id) },
    { id: 'g-s3', name: 'Uncle Ravi & Family', phone: '9898989898', group: 'Relatives', eventIds: ev.map((e) => e.id) },
    { id: 'g-s4', name: 'Tanvi Kapoor', phone: '', group: 'Friends', eventIds: ev.slice(-1).map((e) => e.id) },
    { id: 'g-s5', name: 'Singhania Family', phone: '9822001122', group: 'Neighbours', eventIds: ev.slice(-1).map((e) => e.id) },
  ];
  const saved = saveInvite({ title: 'Sample · ' + displayNames(content) + ' Wedding', ownerId, status: 'PUBLISHED', content, guests, personalize: true, waTemplate: 'Namaste {guest_name},\n\nWith joy we invite you to {headline} — {names}.\n\n{functions}\n\nYour personal invitation: {link}' });
  const names = (g: StoredGuest) => ev.filter((e) => g.eventIds.includes(e.id)).map((e) => e.name);
  addRsvp({ inviteId: saved.id, guestId: 'g-s1', name: 'Sharma Family', phone: '9876543210', attending: true, count: 4, diet: 'Vegetarian', message: 'Blessings to both of you!', eventNames: names(guests[0]) });
  addRsvp({ inviteId: saved.id, guestId: 'g-s2', name: 'Rahul Mehta', phone: '9812345678', attending: true, count: 2, diet: 'Jain', message: 'Can’t wait for the sangeet!', eventNames: names(guests[1]) });
  addRsvp({ inviteId: saved.id, guestId: 'g-s4', name: 'Tanvi Kapoor', attending: false, count: 0, diet: '', message: 'Travelling that week — sending love.', eventNames: names(guests[3]) });
  return saved;
}

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const db = useStore();
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState<Tab>('rsvps');
  const [inviteFilter, setInviteFilter] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [justPublished, setJustPublished] = useState<string | null>(null);

  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!authLoading && !user) router.replace('/login?next=/dashboard'); }, [authLoading, user, router]);
  useEffect(() => {
    const id = params?.get('published');
    if (id) { setJustPublished(id); window.history.replaceState(null, '', '/dashboard'); }
  }, [params]);

  const items = useMemo(() => db.items.filter((i) => !user || i.ownerId === user.id), [db.items, user]);
  const invites = items.filter((i): i is StoredInvite => i.kind === 'invite');
  const ids = new Set(items.map((i) => i.id));
  const rsvps = useMemo(() => db.rsvps.filter((r) => ids.has(r.inviteId)), [db.rsvps, items]); // eslint-disable-line react-hooks/exhaustive-deps
  const byId = (id: string) => items.find((i) => i.id === id);
  const rsvpFor = (inviteId: string, guestId: string) => rsvps.find((r) => r.inviteId === inviteId && r.guestId === guestId);

  /* ----- stats ----- */
  const totalGuests = invites.reduce((s, i) => s + i.guests.length, 0);
  const attending = rsvps.filter((r) => r.attending);
  const headcount = attending.reduce((s, r) => s + r.count, 0);
  const declined = rsvps.length - attending.length;
  const answeredGuests = invites.reduce((s, i) => s + i.guests.filter((g) => rsvpFor(i.id, g.id)).length, 0);
  const responseRate = totalGuests ? Math.round((answeredGuests / totalGuests) * 100) : 0;
  const sentCount = invites.reduce((s, i) => s + i.guests.filter((g) => g.sentAt).length, 0);

  /* ----- table rows ----- */
  const q = query.trim().toLowerCase();
  const rsvpRows = rsvps
    .filter((r) => inviteFilter === 'all' || r.inviteId === inviteFilter)
    .filter((r) => status === 'all' || (status === 'attending' ? r.attending : status === 'declined' ? !r.attending : false))
    .filter((r) => !q || [r.name, r.message, r.diet, r.phone || ''].join(' ').toLowerCase().includes(q))
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));

  const guestRows = invites
    .filter((i) => inviteFilter === 'all' || i.id === inviteFilter)
    .flatMap((i) => i.guests.map((g) => ({ invite: i, guest: g, rsvp: rsvpFor(i.id, g.id) })))
    .filter(({ rsvp }) => status === 'all' || (status === 'attending' ? rsvp?.attending : status === 'declined' ? rsvp && !rsvp.attending : !rsvp))
    .filter(({ guest }) => !q || [guest.name, guest.phone, guest.group].join(' ').toLowerCase().includes(q));

  /* ----- export ----- */
  const eventNamesFor = (inv: StoredInvite, g: StoredGuest) => inv.content.events.filter((e) => !inv.personalize || g.eventIds.includes(e.id)).map((e) => e.name).join(', ');

  const allRsvpRows = [...rsvps].sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  const allGuestRows = invites.flatMap((i) => i.guests.map((g) => ({ invite: i, guest: g, rsvp: rsvpFor(i.id, g.id) })));

  const rsvpSheet = (rows = allRsvpRows): Sheet => ({
    name: 'RSVP responses',
    columns: [
      { header: 'Guest / family', width: 26 }, { header: 'Invitation', width: 30 }, { header: 'Response', width: 12 }, { header: 'Guests coming', width: 14 },
      { header: 'Meal preference', width: 18 }, { header: 'Functions', width: 34 }, { header: 'Phone', width: 16 }, { header: 'Blessing note', width: 44 }, { header: 'Received', width: 22 },
    ],
    rows: rows.map((r) => [r.name, byId(r.inviteId)?.title || '', r.attending ? 'Attending' : 'Declined', r.count, r.diet, r.eventNames.join(', '), r.phone || '', r.message, fmtDateTime(r.updatedAt || r.createdAt)]),
  });
  const guestSheet = (rows = allGuestRows): Sheet => ({
    name: 'Guest list',
    columns: [
      { header: 'Guest / family', width: 26 }, { header: 'Phone', width: 16 }, { header: 'Group', width: 14 }, { header: 'Invitation', width: 30 }, { header: 'Invited to', width: 34 },
      { header: 'Link sent', width: 20 }, { header: 'RSVP', width: 14 }, { header: 'Guests coming', width: 14 }, { header: 'Meal preference', width: 18 }, { header: 'Personal link', width: 52 },
    ],
    rows: rows.map(({ invite, guest, rsvp }) => [
      guest.name, guest.phone, guest.group, invite.title, eventNamesFor(invite, guest), guest.sentAt ? fmtDateTime(guest.sentAt) : 'Not sent',
      rsvp ? (rsvp.attending ? 'Attending' : 'Declined') : 'Awaiting', rsvp ? rsvp.count : '', rsvp?.diet || '', inviteUrl(invite, invite.personalize ? guest.id : undefined),
    ]),
  });
  const summarySheet = (): Sheet => ({
    name: 'Summary',
    columns: [{ header: 'Invitation', width: 34 }, { header: 'Occasion', width: 22 }, { header: 'Guests', width: 10 }, { header: 'Responded', width: 12 }, { header: 'Attending', width: 12 }, { header: 'Headcount', width: 12 }, { header: 'Declined', width: 10 }, { header: 'Link', width: 48 }],
    rows: items.map((i) => {
      const rs = rsvps.filter((r) => r.inviteId === i.id);
      const yes = rs.filter((r) => r.attending);
      return [i.title, i.kind === 'love' ? 'Love Story' : getFunction(i.content.functionId).label, i.kind === 'invite' ? i.guests.length : '', rs.length, yes.length, yes.reduce((s, r) => s + r.count, 0), rs.length - yes.length, inviteUrl(i)];
    }),
  });

  const stamp = () => new Date().toISOString().slice(0, 10);
  const downloadExcel = () => {
    if (!items.length) { toast.error('Nothing to export yet — publish an invitation first.'); return; }
    downloadBlob(buildXlsx([rsvpSheet(), guestSheet(), summarySheet()]), 'uptemp-rsvps-' + stamp() + '.xlsx');
    toast.success('Excel file downloaded');
  };
  const downloadCsv = () => {
    const sheet = tab === 'rsvps' ? rsvpSheet(rsvpRows) : guestSheet(guestRows);
    downloadBlob(new Blob([toCsv(sheet)], { type: 'text/csv;charset=utf-8' }), 'uptemp-' + (tab === 'rsvps' ? 'rsvps' : 'guests') + '-' + stamp() + '.csv');
    toast.success('CSV downloaded');
  };

  /* ----- actions ----- */
  const sendWhatsApp = (invite: StoredInvite, g: StoredGuest) => {
    const link = inviteUrl(invite, invite.personalize ? g.id : undefined);
    const lines = invite.content.events.filter((e) => !invite.personalize || g.eventIds.includes(e.id)).map((e) => '• ' + e.name + ' — ' + formatDate(e.date, { day: 'numeric', month: 'short' }) + (e.venue ? ', ' + e.venue : '')).join('\n');
    const text = (invite.waTemplate || '{link}').replaceAll('{guest_name}', g.name).replaceAll('{names}', displayNames(invite.content)).replaceAll('{headline}', invite.content.headline).replaceAll('{functions}', lines).replaceAll('{link}', link);
    const digits = g.phone.replace(/\D/g, '');
    window.open('https://wa.me/' + (digits.length === 10 ? '91' + digits : digits) + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    markGuestSent(invite.id, g.id);
  };
  const shareItem = (item: StoredItem) => {
    const text = (item.kind === 'love' ? 'A little something for you: ' : 'You’re invited! ') + inviteUrl(item);
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };
  const remove = (item: StoredItem) => {
    if (!confirm('Delete “' + item.title + '” and all its RSVPs? This can’t be undone.')) return;
    deleteItem(item.id);
    if (inviteFilter === item.id) setInviteFilter('all');
    toast.success('Invitation deleted');
  };
  const focusInvite = (id: string, t: Tab) => {
    setInviteFilter(id); setTab(t); setStatus('all');
    document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (authLoading || !user || !db.ready) {
    return <SiteShell><div className="db-loading"><span /><p>Loading your dashboard…</p></div></SiteShell>;
  }

  const fresh = justPublished ? byId(justPublished) : undefined;
  const first = user.name.split(' ')[0];

  return (
    <SiteShell>
      <div className="db">
        {/* header */}
        <section className="db-head">
          <div className="sx-shell db-head-inner">
            <div className="rv">
              <p className="sx-eyebrow">Dashboard</p>
              <h1>Namaste, <em>{first}</em></h1>
              <p className="sx-muted">Your invitations, guest links and RSVPs — all in one place.</p>
            </div>
            <div className="db-head-actions rv" style={{ '--rd': '100ms' } as React.CSSProperties}>
              <Link className="sx-btn sx-btn-primary" href="/templates"><Icon name="plus" /> New invitation</Link>
              <Link className="sx-btn sx-btn-ghost" href="/love-story#builder"><Icon name="heart" /> Love Story</Link>
              <button type="button" className="sx-btn sx-btn-ghost" onClick={downloadExcel}><Icon name="sheet" /> Excel</button>
            </div>
          </div>
        </section>

        <div className="sx-shell db-body">
          {fresh && (
            <div className="db-live">
              <span className="db-live-icon"><Icon name="check" /></span>
              <div>
                <strong>“{fresh.title}” is live</strong>
                <p>{inviteUrl(fresh)}</p>
              </div>
              <div className="db-live-actions">
                <button type="button" className="sx-btn sx-btn-sm sx-btn-ghost" onClick={() => copy(inviteUrl(fresh), 'Link copied')}><Icon name="copy" /> Copy link</button>
                <a className="sx-btn sx-btn-sm sx-btn-ghost" href={'/v/' + fresh.slug} target="_blank" rel="noreferrer"><Icon name="eye" /> View</a>
                {fresh.kind === 'invite' && fresh.guests.length > 0 && <button type="button" className="sx-btn sx-btn-sm sx-btn-primary" onClick={() => focusInvite(fresh.id, 'guests')}><Icon name="send" /> Send to guests</button>}
              </div>
              <button type="button" className="db-x" aria-label="Dismiss" onClick={() => setJustPublished(null)}><Icon name="close" /></button>
            </div>
          )}

          {/* stats */}
          <div className="db-stats">
            <div className="db-stat rv">
              <span className="db-stat-icon"><Icon name="mail" /></span>
              <small>Invitations</small>
              <strong>{items.length}</strong>
              <p>{items.filter((i) => i.status === 'PUBLISHED').length} live · {items.filter((i) => i.status === 'DRAFT').length} draft</p>
            </div>
            <div className="db-stat rv" style={{ '--rd': '70ms' } as React.CSSProperties}>
              <span className="db-stat-icon"><Icon name="users" /></span>
              <small>Guests invited</small>
              <strong>{totalGuests}</strong>
              <p>{sentCount} sent on WhatsApp</p>
            </div>
            <div className="db-stat rv" style={{ '--rd': '140ms' } as React.CSSProperties}>
              <span className="db-stat-icon"><Icon name="rsvp" /></span>
              <small>Response rate</small>
              <strong>{responseRate}<sup>%</sup></strong>
              <div className="db-bar" aria-hidden="true"><i style={{ width: responseRate + '%' }} /></div>
              <p>{answeredGuests} of {totalGuests} guests replied</p>
            </div>
            <div className="db-stat rv" style={{ '--rd': '210ms' } as React.CSSProperties}>
              <span className="db-stat-icon"><Icon name="user-check" /></span>
              <small>Expected headcount</small>
              <strong>{headcount}</strong>
              <p>{attending.length} attending · {declined} declined</p>
            </div>
          </div>

          {/* invitations */}
          <section className="db-section">
            <div className="db-section-head">
              <h2>My invitations</h2>
              <span>{items.length} total</span>
            </div>

            {items.length === 0 ? (
              <div className="db-empty rv">
                <span className="db-empty-icon"><Icon name="mail" /></span>
                <h3>No invitations yet</h3>
                <p>Pick a design, add your functions and publish — guest links and RSVPs will appear here.</p>
                <div className="sx-actions sx-center">
                  <Link className="sx-btn sx-btn-primary" href="/templates"><Icon name="plus" /> Create your first invitation</Link>
                  <button type="button" className="sx-btn sx-btn-ghost" onClick={() => { seedSample(user.id); toast.success('Sample invitation added — delete it any time'); }}>Try with sample data</button>
                </div>
              </div>
            ) : (
              <div className="db-grid">
                {items.map((item, idx) => {
                  const rs = rsvps.filter((r) => r.inviteId === item.id);
                  const yes = rs.filter((r) => r.attending);
                  const isLove = item.kind === 'love';
                  const tpl = !isLove ? (getTemplate(item.content.templateId) || templatesFor(item.content.functionId)[0]) : undefined;
                  const fn = !isLove ? getFunction(item.content.functionId) : undefined;
                  const firstEvent = !isLove ? item.content.events[0] : undefined;
                  const bg = tpl ? tpl.palette : { bg: '#eef4fe', bg2: '#ffffff', ink: '#0f1e36', accent: '#2f6fed' };
                  return (
                    <article key={item.id} className="db-card rv" style={{ '--rd': (idx % 3) * 70 + 'ms' } as React.CSSProperties}>
                      <div className="db-card-art" style={{ background: 'radial-gradient(120% 90% at 50% 0%,' + bg.bg2 + ',' + bg.bg + ' 75%)', color: bg.ink }}>
                        <span className="db-card-badge" data-status={item.status}>{item.status === 'PUBLISHED' ? 'Live' : 'Draft'}</span>
                        <span className="db-card-icon" style={{ color: bg.accent }}><Icon name={isLove ? 'heart' : fn!.icon} /></span>
                        <strong style={{ fontFamily: tpl?.headFont }}>{isLove ? (item.story.from + ' & ' + item.story.to) : displayNames(item.content)}</strong>
                        <small>{isLove ? 'Love Story · passcode protected' : tpl?.name}</small>
                      </div>
                      <div className="db-card-body">
                        <h3>{item.title}</h3>
                        <p className="db-card-meta">
                          <span><Icon name={isLove ? 'lock' : 'calendar'} /> {isLove ? 'Private link' : firstEvent ? formatDate(firstEvent.date, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}</span>
                          <span><Icon name="clock" /> Updated {now ? ago(item.updatedAt, now) : ''}</span>
                        </p>
                        {!isLove && (
                          <div className="db-card-nums">
                            <button type="button" onClick={() => focusInvite(item.id, 'guests')}><strong>{item.guests.length}</strong><span>Guests</span></button>
                            <button type="button" onClick={() => focusInvite(item.id, 'rsvps')}><strong>{rs.length}</strong><span>Replies</span></button>
                            <button type="button" onClick={() => { focusInvite(item.id, 'rsvps'); setStatus('attending'); }}><strong>{yes.reduce((s, r) => s + r.count, 0)}</strong><span>Coming</span></button>
                          </div>
                        )}
                        <div className="db-card-actions">
                          <Link className="sx-btn sx-btn-sm sx-btn-primary" href={editHref(item)}><Icon name="pencil" /> Edit</Link>
                          <a className="sx-btn sx-btn-sm sx-btn-ghost" href={'/v/' + item.slug} target="_blank" rel="noreferrer"><Icon name="eye" /> View</a>
                        </div>
                        <div className="db-card-tools">
                          <button type="button" onClick={() => copy(inviteUrl(item), 'Link copied')} title="Copy link" aria-label="Copy link"><Icon name="link" /></button>
                          <button type="button" onClick={() => shareItem(item)} title="Share on WhatsApp" aria-label="Share on WhatsApp"><Icon name="chat" /></button>
                          <button type="button" onClick={() => { duplicateItem(item.id); toast.success('Copied as a draft'); }} title="Duplicate" aria-label="Duplicate"><Icon name="copy" /></button>
                          <button type="button" className="db-danger" onClick={() => remove(item)} title="Delete" aria-label="Delete"><Icon name="trash" /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                <Link href="/templates" className="db-card-new rv">
                  <span><Icon name="plus" /></span>
                  <strong>New invitation</strong>
                  <small>Wedding, sagai, birthday, griha pravesh…</small>
                </Link>
              </div>
            )}
          </section>

          {/* activity */}
          <section className="db-section" id="activity">
            <div className="db-panel">
              <div className="db-panel-head">
                <div className="db-tabs" role="tablist" aria-label="Activity">
                  <button type="button" role="tab" aria-selected={tab === 'rsvps'} onClick={() => setTab('rsvps')}><Icon name="rsvp" /> RSVP responses <em>{rsvps.length}</em></button>
                  <button type="button" role="tab" aria-selected={tab === 'guests'} onClick={() => setTab('guests')}><Icon name="users" /> Guest list <em>{totalGuests}</em></button>
                </div>
                <div className="db-downloads">
                  <button type="button" className="sx-btn sx-btn-sm sx-btn-primary" onClick={downloadExcel}><Icon name="sheet" /> Download Excel</button>
                  <button type="button" className="sx-btn sx-btn-sm sx-btn-ghost" onClick={downloadCsv}><Icon name="download" /> CSV</button>
                </div>
              </div>

              <div className="db-filters">
                <label className="db-search"><Icon name="search" /><input type="search" placeholder={tab === 'rsvps' ? 'Search name, note, meal…' : 'Search name, phone, group…'} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" /></label>
                <select value={inviteFilter} onChange={(e) => setInviteFilter(e.target.value)} aria-label="Invitation">
                  <option value="all">All invitations</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                </select>
                <div className="db-seg" role="group" aria-label="Status">
                  {(['all', 'attending', 'declined', ...(tab === 'guests' ? ['awaiting'] : [])] as StatusFilter[]).map((s) => (
                    <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>{s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>

              {tab === 'rsvps' ? (
                rsvpRows.length ? (
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead><tr><th>Guest / family</th><th>Response</th><th>Coming</th><th>Meal</th><th>Functions</th><th>Blessing note</th><th>Received</th><th><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {rsvpRows.map((r: RsvpRecord) => (
                          <tr key={r.id}>
                            <td><strong>{r.name}</strong><small>{byId(r.inviteId)?.title}{r.phone ? ' · ' + r.phone : ''}</small></td>
                            <td><span className="db-pill" data-tone={r.attending ? 'yes' : 'no'}><Icon name={r.attending ? 'check' : 'close'} /> {r.attending ? 'Attending' : 'Declined'}</span></td>
                            <td className="db-num">{r.attending ? r.count : '—'}</td>
                            <td>{r.diet || '—'}</td>
                            <td className="db-wrap">{r.eventNames.join(', ') || '—'}</td>
                            <td className="db-note">{r.message ? '“' + r.message + '”' : '—'}</td>
                            <td className="db-time" title={fmtDateTime(r.updatedAt || r.createdAt)}>{now ? ago(r.updatedAt || r.createdAt, now) : ''}</td>
                            <td><button type="button" className="db-icon-btn db-danger" aria-label={'Delete RSVP from ' + r.name} onClick={() => { if (confirm('Delete this RSVP?')) deleteRsvp(r.id); }}><Icon name="trash" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="db-table-empty">
                    <Icon name="rsvp" />
                    <p>{rsvps.length ? 'No responses match these filters.' : 'No RSVPs yet. When guests open their link and reply, their answers appear here instantly.'}</p>
                  </div>
                )
              ) : guestRows.length ? (
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead><tr><th>Guest / family</th><th>Group</th><th>Invited to</th><th>Link</th><th>RSVP</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {guestRows.map(({ invite, guest, rsvp }) => (
                        <tr key={invite.id + guest.id}>
                          <td><strong>{guest.name}</strong><small>{guest.phone || 'No phone'} · {invite.title}</small></td>
                          <td>{guest.group}</td>
                          <td className="db-wrap">{eventNamesFor(invite, guest) || '—'}</td>
                          <td>{guest.sentAt ? <span className="db-pill" data-tone="info"><Icon name="send" /> Sent {now ? ago(guest.sentAt, now) : ''}</span> : <span className="db-pill" data-tone="muted">Not sent</span>}</td>
                          <td>{rsvp ? <span className="db-pill" data-tone={rsvp.attending ? 'yes' : 'no'}>{rsvp.attending ? 'Attending · ' + rsvp.count : 'Declined'}</span> : <span className="db-pill" data-tone="wait"><Icon name="clock" /> Awaiting</span>}</td>
                          <td className="db-row-actions">
                            <button type="button" className="db-icon-btn" aria-label={'Copy link for ' + guest.name} title="Copy personal link" onClick={() => copy(inviteUrl(invite, invite.personalize ? guest.id : undefined), 'Personal link copied')}><Icon name="link" /></button>
                            <a className="db-icon-btn" aria-label={'Open ' + guest.name + '’s invitation'} title="Open as this guest" href={inviteUrl(invite, invite.personalize ? guest.id : undefined)} target="_blank" rel="noreferrer"><Icon name="eye" /></a>
                            <button type="button" className="db-icon-btn db-wa" aria-label={'Send to ' + guest.name + ' on WhatsApp'} title="Send on WhatsApp" onClick={() => sendWhatsApp(invite, guest)}><Icon name="chat" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-table-empty">
                  <Icon name="users" />
                  <p>{totalGuests ? 'No guests match these filters.' : 'No guests yet. Add or import guests in the editor’s “Guests & share” step.'}</p>
                </div>
              )}
              <p className="db-foot">Excel includes three sheets: RSVP responses, Guest list (with each personal link) and a Summary per invitation.</p>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
